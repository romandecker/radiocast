/*
 * @file This file exports a `setup` function that will set up all the app's
 * routes.
 *
 */
"use strict";

var express = require( "express" );
var path = require( "path" );

var UserController = require( "./controllers/UserController" );
var ShowController = require( "./controllers/ShowController" );

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
    var shows = new ShowController();

    router.get( "/users", users.auth.bind(users),
                          users.index.bind(users) );

    router.get( "/users/me", users.auth.bind(users),
                             users.get.bind(users) );

    router.get( "/users/:id", users.auth.bind(users),
                              users.get.bind(users) );

    router.put( "/users/:id/changePassword", users.auth.bind(users),
                                             users.changePassword.bind(users) );
    
    router.post( "/users", users.auth.bind(users),
                           users.create.bind(users) );


    router.put( "/auth/login", users.login.bind(users) );
    router.put( "/auth/logout", users.auth.bind(users),
                                users.logout.bind(users) );

    router.get( "/shows", users.auth.bind(users),
                          shows.index.bind(shows) );

    router.get( "/shows/:id", users.auth.bind(users),
                              shows.get.bind(shows) );

    router.post( "/shows", users.auth.bind(users),
                           shows.create.bind(shows) );

    router.put( "/shows/:id", users.auth.bind(users),
                              shows.update.bind(shows) );


    // enable the api routes under "/api"
    app.use( "/api", router );
};
