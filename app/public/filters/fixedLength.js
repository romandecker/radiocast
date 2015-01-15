"use strict";

var app = angular.module( "yourapp" );

app.filter( "padLeft", function() {
    return function( n, length ) {

        var str = n + "";
        if( str.length < length ) {
            return new Array( (length - str.length)+1 ).join( "0" ) + str;
        } else {
            return str;
        }
    };
} );
