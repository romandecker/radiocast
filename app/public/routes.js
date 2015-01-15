"use strict";

var app = angular.module( "yourapp" );

app.config( ["$routeProvider", function( $routeProvider) {
    
    $routeProvider.
        when( "/users", {
            templateUrl: "public/views/users/index.html",
            controller: "UserListCtrl"
        } ).
        otherwise( {
            redirectTo: "/users"
        } );
}] );

