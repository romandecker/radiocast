"use strict";

var app = angular.module( "radiocast" );

app.controller( "ShowEditCtrl",
                function( $scope,
                          $routeParams,
                          Show ) {

    if( $routeParams.id === "create" ) {
        $scope.show = new Show();
    } else {
        Show.$get( $routeParams.id ).then( function( show ) {
            $scope.show = show;
        } );
    }

    $scope.save = function() {
        $scope.show.$save().then( function() {
            $scope.message = {
                cls: "alert-success",
                text: "Changes saved!"
            };
        } ).catch( function( error ) {
            $scope.message = {
                cls: "alert-danger",
                text: error.message
            };
        } );
    };
} );
