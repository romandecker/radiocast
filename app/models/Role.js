"use strict";

var Checkit = require( "checkit" );
var bookshelf = require( "./BaseModel" );

var validator = new Checkit( {
    name: ["required"]
} );

var Role = bookshelf.model( "Role", {
    tableName: "roles",

    validate: function() {
        return validator.run( this.attributes );
    },

    permissions: function() {
        return this.belongsToMany( "Permission" );
    }

} );

module.exports = Role;
