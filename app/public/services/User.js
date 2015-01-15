"use strict";

var app = angular.module( "yourapp" );

app.factory( "User", function( $Model ) {

    return $Model.extend(
        {
            name: "User",
            url: "/api/users",
        },
        {
        }
    );
} );
