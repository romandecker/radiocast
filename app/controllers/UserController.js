"use strict";

var BaseController = require( "./BaseController" );
var User = require( "../models/User" );

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
                    return user.pruneSensitiveData();
                } );
               
                return results;
            } );
        } else {
            p = query.select().then( function( results ) {
                return User.collection( results ).map( function( user ) {
                    return user.pruneSensitiveData();
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

        User.where( {id: id} ).fetch().then( function( user ) {
            if( !user ) {
                res.status( 404 ).send();
            } else {
                res.json( user.omit("pwhash",
                                    "salt",
                                    "session",
                                    "deleted") );
            }
        } ).catch( function(error) {
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

    changePassword: function( req, res ) {

        var id = req.params.id;
        
        User.where( {id: id} ).fetch().then( function( user ) {
            if( !user ) {
                return { status: 404 };
            } else if( user.get("id")  !== req.session.user.id ){
                return {
                    status: 401,
                    message: "You cannot change someone else's password!"
                };
            } else if( !user.hasPassword(req.body.oldPassword) ) {
                return {
                    status: 401,
                    message: "Current password mismatch"
                };
            } else {
                user.set( "password", req.body.newPassword );
                return user.save().return( { status: 200 } );
            }
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
            User.bySession( req.sessionID ).then( function( user ) {
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
            next();
        }
    }

} );

