"use strict";

process.env.NODE_ENV = "test";
var config = require( "config" );
var bookshelf = require( "../../app/models/ModelBase" );
var models = require( "../../app/models/models" );

var mockApp = {
    get: function(name) {
        if( name === "bookshelf" ) {
            return bookshelf;
        } else if( name === "models" ) {
            return models;
        }
    }
};

module.exports = {
    app: mockApp,
    models: models,
    appUrl: "http://localhost:" + (config.get("port") || 3000),
    testData: require( "./testdata" )
};
