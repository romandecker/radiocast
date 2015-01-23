"use strict";

var Checkit = require( "checkit" );
var bookshelf = require( "./BaseModel" );

var validator = new Checkit( {
    name: ["required"]
} );

var Permission = bookshelf.model( "Permission", {
    tableName: "permissions",

    hasTimestamps: false,

    validate: function() {
        return validator.run( this.attributes );
    },

    roles: function() {
        return this.belongsToMan( "Role" );
    }

} );

module.exports = Permission;

