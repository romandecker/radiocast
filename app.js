/**
 * @file Main entry point for the application. Registers routes, models,
 * controllers and views.
 * 
 * @namespace app
 */

"use strict";

require( "string.prototype.endswith" );
require( "colors" );

require( "sugar" );

//fall back to development, if NODE_ENV is an invalid environment
if( ["development",
     "production",
     "test"].indexOf( process.env.NODE_ENV ) < 0 ) {

    if( process.env.NODE_ENV ) {
        console.log( "Invalid environment " + process.env.NODE_ENV.red );
    }

    console.log( "Falling back to " + "development".cyan );
    process.env.NODE_ENV = "development";
}

var express = require( "express" );
var bodyParser = require( "body-parser" );
var config = require( "config" );
var glob = require( "glob" );

var routes = require( "./app/routes" );
var models = require( "./app/models/models" );
var controllers = require( "./app/controllers/controllers" );

var app = express();

app.use( config.get("logger") );

app.use( bodyParser.json() );

var bookshelf = require("./app/models/BaseModel");
app.set( "bookshelf", bookshelf ); 
app.set( "models", models );

app.set( "controllers", controllers );

app.set( "views", "app/views" );
app.set( "view engine", "ejs" );

// returns all files in the given directory (and subdirectories) that have the
// given suffix
var filesIn = function( directory, suffix ) {
    var files = glob.sync( directory + "/**/*" + suffix  );
    
    return files.map( function( file ) {
        return file.substring( directory.length+1 );
    } );
};

//provide these to all views (i.e. the index.ejs view basically)
app.locals.ngServices = filesIn( "app/public/services", ".js" );
app.locals.ngControllers = filesIn( "app/public/controllers", ".js" );
app.locals.ngDirectives = filesIn( "app/public/directives", ".js" );
app.locals.ngViews = filesIn( "app/public/views", ".html" );
app.locals.ngDirectives = filesIn( "app/public/directives", ".js" );
app.locals.ngFilters = filesIn( "app/public/filters", ".js" );
app.locals.utils = filesIn( "app/public/utils", ".js" );

routes.setup( app );

app.locals.appinfo = {
    environment: process.env.NODE_ENV
};

if( config.has("additionalMiddleware") ) {
    //allow config-files to specify additional middleware
    //the test-config uses this mechanism to install a coverage-collector,
    //not exactly nice, but it works, so meh...
    var middlewares = config.get( "additionalMiddleware" );
    Object.each( middlewares, function( route, middleware ) {
        app.use( route, middleware );
    } );
}

bookshelf.onSchemaLoaded( function() {
    var server = app.listen( config.get("port"), function() {
        //this output is actually needed for starting the app via grunt
        console.log( "Listening on port %d in %s", server.address().port,
                                                   process.env.NODE_ENV.cyan );
    } );
} );
