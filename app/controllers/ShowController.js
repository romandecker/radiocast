"use strict";

var BaseController = require( "./BaseController" );
var Show = require( "../models/Show" );

module.exports = BaseController.extend( {

    Model: Show,

    pagination: {
        type: "always",
        perPage: 50
    }

} );

