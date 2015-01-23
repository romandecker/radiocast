"use strict";

var Checkit = require( "checkit" );
var bookshelf = require( "./BaseModel" );

// make sure the role-model is loaded
require( "./Role" );

var validator = new Checkit( {
    name: ["required"],
    url: ["required"],
    schedule: ["required"],
    duration: ["number", "required"]
} );

var Show = bookshelf.model( "Show", {
    tableName: "shows",

    validate: function() {
        return validator.run( this.toJSON( { shallow: true } ) );
    }

}, {

} );

module.exports = Show;

