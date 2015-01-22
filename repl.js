"use strict";

var repl = require( "repl" );
var promisify = require( "repl-promised" ).promisify;
var _ = require( "underscore" );
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

var glob = require( "glob" );

var controllers = require( "./app/controllers/controllers" );

var bookshelf = require("./app/models/BaseModel");

// returns all files in the given directory (and subdirectories) that have the
// given suffix
var filesIn = function( directory, suffix ) {
    var files = glob.sync( directory + "/**/*" + suffix  );
    
    return files.map( function( file ) {
        return file.substring( directory.length+1 );
    } );
};

var models = filesIn( "app/models", ".js" );
var controllers = filesIn( "app/controllers", ".js" );

bookshelf.onSchemaLoaded( function() {

    var server = repl.start( {
        prompt: "yourapp:" + process.env.NODE_ENV + "> "
    } );

    // make sure prompt appears only after promise completes for statements
    // that return promises (like most DB-queries)
    promisify( server );

    server.context.dump = function() {
        console.dir( arguments );
    };

    _.forEach( models, function( model, name ) {
        server.context[name] = require( model );
    } );

    _.forEach( controllers, function( controller, name ) {
        server.context[name] = require( controller );
    } );

} );

