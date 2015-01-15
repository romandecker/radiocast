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

            p = this.paginate( query, req.query );
        } else {
            p = query.select().then( function( results ) {
                return User.collection( results );
            } );
        }

        p.then( function( results ) {
            res.json( results );
        } ).catch( function( error ) {
            console.error( error );
            res.status( 500 ).json( error );
        } );

    },

    login: function( req, res ) {

        User.login( req.body.username, req.body.password );

        if( !req.body.username ||
            !req.body.password ) {
            
            // username or password missing
            res.status( 400 ).send();
            return;
        }

        User.login(
            req.body.username,
            req.body.password
        ).then( function( token ) {
            if( !token ) {
                res.status( 400 ).send();
            } else {
                res.cookie( "session", token, {
                    path: "/",
                    expires: 0      //indicates session cookie
                } );
                res.json( { session: token } );
            }
        } ).catch( function( error ) {
            console.error( error );
            res.status( 500 );
        } );

    },

    logout: function( req, res ) {

    },

    auth: function( req, res, next ) {

        if( req.cookies.session ) {
            User.bySession( req.cookies.session ).then( function( user ) {
                if( user ) {
                    //TODO set user in session
                    next();
                } else {
                    res.status( 401 ).send();
                }
            } );
        } else {
            res.status( 401 ).send();
        }
    }

} );

