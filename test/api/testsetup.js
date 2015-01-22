"use strict";

process.env.NODE_ENV = "test";
var config = require( "config" );

module.exports = {
    appUrl: "http://localhost:" + (config.get("port") || 3000),
    testData: require( "./testdata" )
};
