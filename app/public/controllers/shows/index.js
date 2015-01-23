"use strict";

var app = angular.module( "radiocast" );

app.controller( "ShowListCtrl",
                function( $scope,
                          Show ) {

    $scope.perPage = 10;
    $scope.$watchGroup( ["page"], function() {
        Show.$query( {
            page: $scope.page,
            perPage: $scope.perPage,
        } ).then( function( shows ) {
            $scope.shows = shows;
        } );
    } );

    $scope.page = 1;
} );
