/**
 * @file As grunt-knex-migrate does not support seeding (yet), this is the
 * alternative solution. This script will use knex to create and run seed files.
 * It operates dependant of the current environment which is detected the same
 * way the actual app detects the environment.
 * 
 * @namespace app
 */
"use strict";

var path = require( "path" );
var dateFormat = require( "dateformat" );
require( "string.prototype.endswith" );
require( "colors" );
require( "sugar" );

var argv = require( "yargs" )
            .usage( "Usage: $0 command [OPTIONS]" )
            .argv;

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

var bookshelf = require("../models/BaseModel");
var knex = bookshelf.knex;

var env = process.env.NODE_ENV.toLowerCase();

var command = argv._[0];

if( !command ) {
    console.error( "No command given!" );
    process.exit( 1 );
}

bookshelf.onSchemaLoaded( function() {

    var dir = path.join( __dirname, env );

    if( command === "make" ) {
        var name = argv._[1];
        if( !name ) {
            console.error( "No seed name given!" );
            process.exit( 1 );
        }

        name = dateFormat( new Date(), "yyyymmddhhMMss" ) + "_" + name;

        knex.seed.make( name, { directory: dir } ).then( function() {
            console.log( "Seed created:", path.join(dir, name + ".js") );
            process.exit( 0 );
        } ).catch( function( error ) {
            console.error( error );
            process.exit( 1 );
        } );
    
    } else if( command === "run" ) {
        console.log( "Running seeds for", env.cyan );

        knex.seed.run( { directory: dir } ).then( function() {
            console.log( "Seeds run" );
            process.exit( 0 );
        } ).catch( function( error ) {
            console.error( error );
            process.exit( 1 );
        } );

    } else {
        console.error( "'" + command + "' is not a valid command. " +
                     "Valid commands are make and run" );
        process.exit( 1 );
    }

} );
