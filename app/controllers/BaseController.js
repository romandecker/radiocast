/**
 * @file Defines the base controller class.
 */

"use strict";
var CheckitError = require( "checkit" ).Error;
var BPromise = require( "bluebird" );
var _ = require( "underscore" );

function extend( Parent, instanceProps, staticProps ) {

    function F(){}

    F.prototype = new Parent();

    _.extend( F.prototype, instanceProps );
    _.extend( F, staticProps );

    return F;
}

/**
 * @class Controller
 */
var Controller = function() {

    /**
     * Paginates the given query. Note that the controller must have a
     * `pagination` property specified that at least contains a default
     * `perPage` field.
     *
     * @param {KnexQueryBuilder} baseQuery
     *        The base-query to paginate. You can just pass `req.query` here in
     *        most cases.
     * @param {Controller.PaginateOptions} [options] 
     *        Options-hash. Supported options: `page` and `perPage`. Note that
     *        `page` will default to `1` and `perPage` will default to whatever
     *        this controller's pagination.perPage property specifies.
     *
     * @returns {Object}
     *          A promise that resolves when the paginated collection is
     *          available. The promise will be resolved with an object looking
     *          as follows:
     *
     * @function paginate
     * @memberof Controller#
     * @protected
     */
    this.paginate = function( baseQuery, options ) {

        var self = this;
        var tableName = this.Model.forge().tableName;
        var countQuery = baseQuery.clone().count( 
                tableName + ".id AS __count"
        ).then( function(result) {
            return result[0].__count;
        } );

        var resultQuery = baseQuery.clone();
        
        var page = (options.page || 1) - 1;
        var perPage = (options.perPage || this.pagination.perPage);
        perPage = Math.min( perPage, this.pagination.perPage );

        resultQuery.limit( perPage );
        resultQuery.offset( page * perPage );

        resultQuery.select().then( function( results ) {
            return self.Model.collection( results );
        } );

        // return a promise that resolves when both queries have completed
        return BPromise.all( [ resultQuery,
                               countQuery ] ).then( function( results ) {

            return {
                items: self.Model.collection( results[0] ),
                page: page + 1,
                totalCount: results[1]
            };
       } );
    };

    /**
     * Base implementation of index. Lists all models of this controller's
     * model. If this controller has a `pagination` property, this method
     * supports pagination by checking `page` and `perPage` fields in the
     * request's `query` property.
     *
     * @param {Request} express.js-request object.
     * @param {Response} express.js-response object.
     *
     * @function index
     * @memberof Controller@
     * @public
     */
    this.index = function( req, res ) {

        var self = this;
        var query = this.Model.query();


        //check if a search query is specified
        if( req.query.s ) {
            var terms = req.query.s.split( /\s/ );

            var searchable = this.searchable || [];

            _.each( terms, function( term ) {
                _.each( searchable, function( columnName ) {
                    
                    query = query.orWhere( columnName,
                                             "LIKE",
                                             "%" + term + "%" );
                } );
            } );
        }


        var p;
        // if pagination is specified
        // if pagination is set to "auto", only paginate if "page" is present
        if( this.pagination &&
            (this.pagination.type !== "auto" || req.query.page) ) {

            p = this.paginate(
                query,
                req.query
            );
        } else {
            p = query.select().then( function( results ) {
                return self.Model.collection( results );
            } );
        }
        
        p.then( function( results ) {
            res.json( results );
        } ).catch( function(error) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
        
    };

    /**
     * Base implementation of get. Gets a single model by id.
     *
     * @param {Request} express.js-request object.
     * @param {Response} express.js-response object.
     *
     * @function get
     * @memberof Controller#
     * @public
     */
    this.get = function( req, res ) {
        var id = req.params.id;

        this.Model.where( {id: id} ).fetch().then( function( result ) {
            if( !result ) {
                res.status( 404 ).send();
            } else {
                res.json( result );
            }
        } ).catch( function(error) {
            res.status( 500 ).json( error );
        } );
    };

    /**
     * Base implementation of create. Creates a model in the DB with the data
     * specified in the request body (and query string).
     *
     * @param {Request} express.js-request object.
     * @param {Response} express.js-response object.
     *
     * @function get
     * @memberof Controller#
     * @public
     */
    this.create = function( req, res ) {

        var data = Object.merge( req.body, req.query );

        this.Model.forge( data ).save().then( function( savedModel ) {
            res.status( 201 ).json( savedModel );
        } ).catch( CheckitError, function( error ) {
            res.status( 400 ).json( error );
        } ).catch( function(error) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    };

    /**
     * Base implementation of update. Updates an existing model in the DB with
     * the data specified in the request body (and query string).
     *
     * @param {Request} express.js-request object.
     * @param {Response} express.js-response object.
     *
     * @function update
     * @memberof Controller#
     * @public
     */
    this.update = function( req, res ) {
        
        var id = req.params.id;
        var data = Object.merge( req.body, req.query );

        this.Model.where( { id: id } ).fetch().then( function( result ) {
            if( !result ) {
                res.status( 404 ).send();
            } else {
                return result.save( data, { patch: true } ).then( function(savedModel) {
                    res.status( 200 ).json( savedModel );
                } );
            }
        } ).catch( CheckitError, function( error ) {
            res.status( 400 ).json( error );
        } ).catch( function( error ) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    };

    /**
     * Base implementation of destroy. Deletes an existing model in the DB by
     * id.
     *
     * @param {Request} express.js-request object.
     * @param {Response} express.js-response object.
     *
     * @function destroy
     * @memberof Controller#
     * @public
     */
    this.destroy = function( req, res ) {
        
        var id = req.params.id;

        this.Model.where( { id: id } ).fetch().then( function( result ) {

            if( !result ) {
                res.status( 404 ).send();
            } else {
                return result.destroy().then( function() {
                    res.status( 200 ).send();
                } );
            }
        } ).catch( function(error) {
            res.status( 500 ).json( error );
        } );
    };
};

/**
 * Create a new controller by extending from the base controller. Derived
 * controllers may further be extended by using their `extend` method.
 *
 * @param {object} instanceProps
 *        These properties will be available for every instance of the
 *        controller. You must at least specify `Model` here if you want to use
 *        any of BaseController's CRUD-implementations.
 *
 * @param {object} [staticProps]
 *        These properties will be available on the Controller object itself.
 *        Note that all controllers will automatically have an extend method.
 *
 * @returns A controller class derived from BaseController.
 *
 * @function extend
 * @memberof Controller
 * @public
 *
 * @example
 * // create a new controller that will use all BaseController CRUD
 * // implementations but has a custom destroy action.
 * var CustomerController = ControllerBase.extend( {
 *     Model: Customer,
 *     destroy: function( req, res ) {
 *         console.log( "Custom destroy!" );
 *         // ...
 *     }
 * } );
 */
Controller.extend = function( instanceProps, staticProps ) {
    
    var Child = extend( Controller, instanceProps, staticProps );
    Child.extend = extend.bind( null, Child );

    return Child;
};

module.exports = Controller;

/**
 * @typedef PaginateOptions
 *          Options to pass to Controller#paginate
 * @type {object}
 * @property {number} page
 *           The current page. The first page starts at 1.
 * @property {number} perPage
 *           The number of items per page.
 * @property {string} type
 *           Specifies the type of pagination. When set to anything other than
 *           "auto", all requests will be automatically paginated. If set to
 *           "auto", only requests carrying a `page` parameter will be
 *           paginated.
 *
 * @memberOf Controller
 */

