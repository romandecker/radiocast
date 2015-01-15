"use strict";

var app = angular.module( "yourapp" );

app.controller( "UserListCtrl",
                function( $scope,
                          User ) {

    $scope.perPage = 10;
    $scope.$watchGroup( ["page"], function() {
        User.$query( {
            page: $scope.page,
            perPage: $scope.perPage,
        } ).then( function(users) {
            $scope.users = users;
        } );
    } );

    $scope.page = 1;
} );
