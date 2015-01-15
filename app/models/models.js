"use strict";

var fs = require( "fs" );
var path = require( "path" );
require( "colors" );

require( "string.prototype.endswith" );

var files = fs.readdirSync( __dirname );

files.filter( function(file) {
    return file.endsWith(".js") && file !== path.basename( __filename );
} ).forEach( function( file ) {

    console.log( "Loading model", file.green );

    var model = require( "./" + file );
    var name = file.substring( 0, file.length - path.extname(file).length );
    
    module.exports[name] = model;
} );
