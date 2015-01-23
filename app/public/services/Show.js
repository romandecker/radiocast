"use strict";

var app = angular.module( "radiocast" );

app.factory( "Show", function( $Model,
                               $http ) {

    return $Model.extend(
        {
            name: "Show",
            url: "/api/shows",
        },
        {
            // instance methods
        },
        {
            // static methods
        }
    );
} );
