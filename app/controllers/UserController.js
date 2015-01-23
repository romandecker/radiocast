"use strict";

var BaseController = require( "./BaseController" );
var User = require( "../models/User" );
var CheckitError = require( "checkit" ).Error;
var _ = require( "underscore" );
var BPromise = require( "bluebird" );

module.exports = BaseController.extend( {

    Model: User,

    pagination: {
        type: "always",
        perPage: 50,
    },

    index: function( req, res ) {

        req.session.user.can( "manage_users" ).bind( this ).then( function() {
            var query = User.query();
            var p;

            p = this.paginate( query, req.query ).then( function( results ) {
                
                results.items = results.items.map( function(user) {
                    return _.omit( user.toJSON(), User.sensitiveData );
                } );
               
                return results;
            } );

            p.then( function( results ) {
                res.json( results );
            } ).catch( function( error ) {
                console.error( error );
                res.status( 500 ).json( error );
            } );
        } ).catch( function( err ) {
            res.status( 403 ).send();
        } );
    },

    get: function( req, res ) {

        var id = req.params.id;

        if( !id ) {
            // req.session.user will always be set because of auth
            id = req.session.user.id;
        }

        User.where( { id: id } ).fetch( {
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

        req.session.user.logout().then( function() {
            return new BPromise( function( resolve, reject ) {
                req.session.destroy( function( err ) {
                    if( err ) {
                        reject( err );
                    } else {
                        resolve( "ok" );
                    }
                } );
            } );
        } ).then( function() {
            res.status( 200 ).send();
        } ).catch( function(error) {
            console.error( error );
            res.status( 500 ).send();
        } );

    },

    create: function( req, res ) {

        req.session.user.can( "manage_users" ).then( function() {

            var u = new User( req.body );
            return u.save().then( function() {
                res.status( 201 ).send();
            } ).catch( CheckitError, function( error ) {
                res.status( 400 ).json( error );
            } ).catch( function( error ) {
                res.status( 500 ).send(); 
            } );

        } ).catch( function() {
            res.status( 403 ).send();
        } );
    },

    changePassword: function( req, res ) {

        var id = req.params.id;

        var query;
        if( id === "me" ) {
            query = req.session.user;
        } else {
            query = User.where( { id: id } );
        }
        
        query.fetch().then( function( user ) {

            return req.session.user.can( "manage_users" ).then(
                function() { return true; },
                function() { return false; }
            ).then( function( canChangeOthers ) {

                if( !user ) {
                    return { status: 404 };
                } else if( user.get("id") !== req.session.user.id &&
                           !canChangeOthers ) {
                    return {
                        status: 403,
                        message: "You cannot change someone else's password!"
                    };
                } else if( !canChangeOthers &&
                           !user.hasPassword(req.body.oldPassword) ) {
                    return {
                        status: 400,
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


            var query;
            if( process.env.NODE_ENV === "development" &&
                process.env.AUTOLOGIN !== "false" ) {
                // auto log-in in development
                query = User.where( { id: 1 } );
            } else {
                query = User.bySession( req.sessionID );
            }

            query.fetch( {
                withRelated: ["roles", "roles.permissions"]
            } ).then( function( user ) {
                if( user ) {
                    req.session.user = user;
                    next();
                } else {
                    req.session.user = null;
                    res.status( 401 ).json(
                        { message: "You must be logged in for this request" }
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
                console.error( error );
                next( error );
            } );
        }
    }

} );

