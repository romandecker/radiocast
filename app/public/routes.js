"use strict";

var app = angular.module( "radiocast" );

app.config( ["$routeProvider", function( $routeProvider) {
    
    $routeProvider.
        when( "/shows", {
            templateUrl: "public/views/shows/index.html",
            controller: "ShowListCtrl"
        } ).
        when( "/shows/:id", {
            templateUrl: "public/views/shows/edit.html",
            controller: "ShowEditCtrl"
        } ).
        when( "/users", {
            templateUrl: "public/views/users/index.html",
            controller: "UserListCtrl"
        } ).
        when( "/users/:id", {
            templateUrl: "public/views/users/edit.html",
            controller: "UserEditCtrl"
        } ).
        otherwise( {
            redirectTo: "/users"
        } );
}] );

