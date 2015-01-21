"use strict";

var BaseController = require( "./BaseController" );
var User = require( "../models/User" );
var CheckitError = require( "checkit" ).Error;
var _ = require( "underscore" );

module.exports = BaseController.extend( {

    Model: User,

    pagination: {
        type: "auto",
        perPage: 50,
    },

    index: function( req, res ) {

        var query = User.query();
        var p;

        if( this.pagination &&
            (this.pagination.type !== "auto" || req.query.page) ) {

            p = this.paginate( query, req.query ).then( function( results ) {
                
                results.items = results.items.map( function(user) {
                    return _.omit( user.toJSON(), User.sensitiveData );
                } );
               
                return results;
            } );
        } else {
            p = query.select().then( function( results ) {
                return User.collection( results ).map( function( user ) {
                    return _.omit( user.toJSON(), User.sensitiveData );
                } );
            } );
        }

        p.then( function( results ) {
            res.json( results );
        } ).catch( function( error ) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    },

    get: function( req, res ) {

        var id = req.params.id;

        var query;
        if( req.params.id ) {
            query = User.where( { id: id } );
        } else if( req.sessionID ) {
            query = User.bySession( req.sessionID );
        } else {
            res.status( 400 ).send();
        }

        query.fetch( {
            withRelated: ["roles", "roles.permissions"]
        } ).then( function( user ) {
            if( !user ) {
                res.status( 404 ).send();
            } else {

                res.json( _.omit( user.toJSON( { omitPivot: true } ),
                                  "pwhash",
                                  "salt",
                                  "session",
                                  "deleted") );
            }
        } ).catch( function(error) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    },

    login: function( req, res ) {

        if( !req.body.username ||
            !req.body.password ) {
            
            // username or password missing
            res.status( 400 ).send();
            return;
        }

        User.login(
            req.body.username,
            req.body.password,
            req.sessionID
        ).then( function( user ) {
            if( !user ) {
                res.status( 400 ).send();
            } else {
                req.session.user = user;
                res.status( 200 ).send();
            }
        } ).catch( function( error ) {
            console.error( error );
            res.status( 500 );
        } );

    },

    logout: function( req, res ) {

    },

    create: function( req, res ) {

        req.session.user.can( "manage_users" ).then( function() {
        } ).then( function() {

            var u = new User( req.body );
            return u.save().then( function() {
                res.status( 200 ).send();
            } ).catch( CheckitError, function( error ) {
                res.status( 400 ).json( error );
            } ).catch( function( error ) {
                res.status( 500 ).send(); 
            } );

        } ).catch( function() {
            res.status( 401 ).send();
        } );
    },

    changePassword: function( req, res ) {

        var id = req.params.id;
        
        User.where( {id: id} ).fetch().then( function( user ) {

            return req.session.user.can( "manage_users" ).then(
                function() { return true; },
                function() { return false; }
            ).then( function( canChangeOthers ) {

                if( !user ) {
                    return { status: 404 };
                } else if( user.get("id") !== req.session.user.id &&
                           !canChangeOthers ) {
                    return {
                        status: 401,
                        message: "You cannot change someone else's password!"
                    };
                } else if( !canChangeOthers &&
                           !user.hasPassword(req.body.oldPassword) ) {
                    return {
                        status: 401,
                        message: "Current password mismatch"
                    };
                } else {
                    user.set( "password", req.body.newPassword );
                    return user.save().return( { status: 200 } );
                }
            } );
        } ).then( function( resp ) {
            res.status( resp.status );
            if( resp.message ) {
                res.json( { message: resp.message } );
            } else {
                res.send();
            }
        } ).catch( function(error) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    },

    auth: function( req, res, next ) {

        if( !req.session.user ) {
            User.bySession( req.sessionID ).fetch( {
                withRelated: ["roles", "roles.permissions"]
            } ).then( function( user ) {
                if( user ) {
                    req.session.user = user;
                    next();
                } else {
                    res.status( 401 ).json(
                        { message: "You must be logged for this request" }
                    );
                }
            } );
        } else {
            User.where(
                { id: req.session.user.id }
            ).fetch().then( function( user ) {
                req.session.user = user;
                next();
            } ).catch( function( error ) {
                next( error );
            } );
        }
    }

} );

