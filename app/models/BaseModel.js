/**
 * @file Defines the base model class that all models extend from. It will setup
 * bookshelf so that models may use it accordingly. Each model inherited from
 * the base model will have a `created_at` and an `updated_at` property. Keeping
 * this property up-to-date is handled by the base model.
 *
 * The base model also makes sure that only attributes declared as writable can
 * be persisted to the database. By default, every column in the backing table
 * is writable. If the Model passes a `writableAttributes` array when extending,
 * ***only the attributes specified there will be writable***.
 *
 * Child classes may specify a `validate` member function that will
 * automatically be called on save.
 *
 * This module exports the modified `bookshelf` object, so that models may use
 * it.
 */

"use strict";

var config = require( "config" );
var knex = require( "knex" )( config.get( "db" ) );
var bookshelf = require( "bookshelf" )( knex );
var BPromise = require( "bluebird" );
var pad = require( "pad" );
var _ = require( "underscore" );
_.mixin( require("underscore.inflections") );

bookshelf.plugin( "registry" );

// will be filled with metadata for each defined model
var schema = {};
var schemaPromises = [];


/**
 * Called on saving for each date(time)-attribute. This will convert
 * attributes that are strings, but declared as date(time) according to the
 * schema to dates.
 *
 * @memberof Model
 * @private
 */
function fixDateTimeIn( object, name ) {
    if( name in object &&
        typeof object[name] === "string" ) {
        object[name] = new Date( object[name] );
    }
}

/**
 * Replaces bookshelf's base model with our own base model.
 * @class Model
 */
bookshelf.Model = bookshelf.Model.extend( {
    hasTimestamps: true,

    /**
     * Called whenever someone initializes a new model using `new`.
     * Model classes ***must call this*** when they override this method.
     *
     * @memberof Model#
     * @protected
     */
    initialize: function() {

        var self = this;

        self.dateTimes = [];

        //register saving callback
        this.on( "saving", this.saving.bind(this) );

        //by default, all columns (except the timestamp columns) are writable
        //this array is filled later on
        this.writableAttributes = [];

        var customWritableProvided = "writable" in this;

        // rely on the schema object that has been updated whenever a model is
        // created through our overwritten bookshelf.extend function
        var tableSchema = schema[this.tableName];

        _.each( tableSchema, function( columnInfo, name ) {

            // add fixer functions for date(time) columns
            if( columnInfo.type === "datetime" ) {
                self.dateTimes.push( name );
            } else if( columnInfo.type === "date" ) {
                self.on( "fetched", self.fixDateOut.bind(self, name) );
            }
            
            // if the child class does not specify custom
            // writable attributes, assume sane defaults
            if( !customWritableProvided &&
                name !== "created_at" &&
                name !== "updated_at" ) {
                self.writableAttributes.push( name );
            }

        } );
    },


    /**
     * Called on saving. Removes non-writable attributes from the model, before
     * they reach the database. As this typically removes timestamps as well,
     * they are set again after removal.
     *
     * @memberof Model#
     * @private
     */
    saving: function( model, attrs, options ) {

        var self = this;

        //if patch is true, attrs is used instead of this.attributes
        if( options.patch ) {
            var toRemove = [];
            for( var attr in attrs ) {
                if( attrs.hasOwnProperty(attr) ) {
                    if( this.writableAttributes.indexOf(attr) < 0 ) {
                        toRemove.push( attr );
                    }
                }
            }

            toRemove.forEach( function(attr) {
                delete attrs[attr];
            } );
        } else {
            this.attributes = this.pick( this.writableAttributes );
        }

        this.dateTimes.forEach( function(column) {
            fixDateTimeIn( self.attributes, column );
            fixDateTimeIn( attrs, column );
        } );

        if( this.hasTimestamps ) {
            attrs.updated_at = this.attributes.updated_at = new Date();
            attrs.created_at = this.attributes.created_at = attrs.updated_at;
        }

        if( this.validate ) {
            return this.validate( model, attrs, options );
        }
    },
    /**
     * This will convert date-columns (they come as a javascript date object,
     * that includes time...) to a string of the format `YYYY-M-D` for each
     * fetched model.
     *
     * @memberof Model#
     * @private
     */
    fixDateOut: function( name, model, resp, options ) {

        if( model.attributes[name] ) {
            var date = model.attributes[name];

            model.attributes[name] = pad( 4, date.getFullYear() + "", "0" ) + 
                               "-" + pad( 2, (date.getMonth() + 1) + "", "0") +
                               "-" + pad( 2, date.getDate() + "", "0" );
        }
    },
    
    /**
     * Updates a models relation defined via hasMany or belongsToMany.
     *
     * @param {string} relationName
     *        The relation to update as given by `hasMany` or `belongsToMany`
     * @param {Array.<Model|number>} data
     *        An array of models and/or IDs.
     * @param {ModelBase.UpdateRelationOptions} options
     *        Additional options.
     *
     * @example
     *  reservation.updateRelation( "rooms",
     *                              [ { id: 1, configuration: "SINGLE" } ],
     *                              { pivots: [ "configuration" ] }
     *                            );
     *
     * @memberof Model#
     * @protected
     *
     */
    updateRelation: function( relationName,
                              data,
                              options ) {

        if( typeof data  === "undefined" ) {
            return this;
        }

        var self = this;

        //default the column name to some sane value
        if( !options.columnName ) {
            options.columnName = _.singularize( relationName ) + "_id";
        }

        //default pivots to none
        options.pivots = options.pivots || [];

        // data may have models and IDs, save all IDs to ids
        var ids = data.map( function( elem ) {
            if( elem.id ) {
                return elem.id;
            } else {
                return elem;
            }
        } );

        var toRemove = [];
        var toAdd = [];
        var toUpdate = {};

        return this.related(    //
            relationName        // first, fetch all existing relations
        ).fetch(                //
            { transacting: options.transacting }
        ).then( function( fetched ) {
            
            // only ids needed here
            fetched = fetched.map( function( elem ) { return elem.id; } );
            
            // add missing elements in update-data to toRemove list
            fetched.forEach( function( id ) {
                if( ids.indexOf(id) < 0 ) {
                    toRemove.push( id );
                }
            } ); 

            ids.forEach( function( id, i ) {
                if( fetched.indexOf(id) < 0 ) {
                    // add additional elements in update-data to toAdd list
                    var add = {};
                    add[options.columnName] = id;
                    options.pivots.forEach( function(pivot) {
                        add[pivot] = data[i][pivot];
                    } );
                    toAdd.push( add );
                } else if( typeof data[i] === "object" ) {
                    //if a relation is specified, that already exists, make sure
                    //to update its pivots
                    toUpdate[id] = {};
                    options.pivots.forEach( function(pivot) {
                        toUpdate[id][pivot] = data[i][pivot];
                    } );
                }
            } );

            // now, update all needed pivots
            var promises = [];
            _.each( toUpdate, function( pivots, id ) {
                var opts = { query: { where: {} } };
                opts.query.where[options.columnName] = id;
                opts.transacting = options.transacting;
                var promise = self[relationName]().updatePivot(
                    pivots,
                    opts
                );

                promises.push( promise );
            } );

            var opts = { transacting: options.transacting };

            // remove old relations and add new ones
            promises.push( self[relationName]().detach(toRemove, opts) );
            promises.push( self[relationName]().attach(toAdd, opts) );

            // return a promise resolving to the original object when all
            // updates have completed
            return BPromise.all( promises ).then( function() {
                return self;
            } );
        } );

    },

} );


// overwrite bookshelf's extend so that the model's schema gets added to the
// schema object
var originalExtend = bookshelf.Model.extend;

/**
 * Create a new model class, extending from the base. This will check the
 * database to store the model's schema.
 *
 * @memberof Model#
 * @public
 */
bookshelf.Model.extend = function( options ) {
    
    var ret = originalExtend.apply( this, arguments );

    var p = knex( options.tableName ).columnInfo().then( function( info ) {
        schema[options.tableName] = info;
    } );

    schemaPromises.push( p );

    return ret;
};

module.exports = bookshelf;

module.exports.onSchemaLoaded = function( callback ) {
    BPromise.all( schemaPromises ).then( callback );
};


/**
 * @typedef UpdateRelationOptions
 *
 * Additional optoins for Model#updateRelation
 *
 * @type {object}
 * @property {string[]} [pivots]
 *           Array of pivot-data column-names in the joining table. Each of
 *           these keys will be plucked from each element in data and updated in
 *           the joining table via `updatePivot` (or added there).
 * @property {KnexTransaction} [transacting] Use this transaction for all
 *           underlying bookshelf operations.
 *
 * @memberof Model
 */
