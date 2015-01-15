/*
 * @file This file exports a `setup` function that will set up all the app's
 * routes.
 *
 */
"use strict";

var express = require( "express" );
var path = require( "path" );

var UserController = require( "./controllers/UserController" );

/* does stuff */
module.exports.setup = function( app ) {

    var router = express.Router();
    
    // serve static files under "/public"
    app.use( "/public", express.static(path.join(__dirname, "public")) );

    // main page
    app.get( "/", function( req, res ) {
        res.render( "index" );
    } );

    var users = new UserController();

    router.get( "/users", users.auth.bind(users), users.index.bind(users) );

    router.put( "/auth/login", users.login.bind(users) );

    // enable the api routes under "/api"
    app.use( "/api", router );
};