"use strict";

var app = angular.module( "radiocast" );

app.controller( "UserEditCtrl",
                function( $scope,
                          $routeParams,
                          User ) {

    if( $routeParams.id === "create" ) {
        $scope.user = new User();
    } else {
        User.$get( $routeParams.id ).then( function( user ) {
            $scope.user = user;

            User.fetchLoggedInUser().then( function(user) {
                $scope.currentUser = user;
            } );
        } );
    }


    $scope.changePassword = function() {
        
        $scope.user.changePassword(
            $scope.oldPassword,
            $scope.user.password
        ).then( function() {

            $scope.message = {
                cls: "alert-success",
                text: "Password successfully changed!"
            };
        } ).catch( function( response ) {
            $scope.message = {
                cls: "error",
                text: response.data.message
            };
        } );
                                        
    };

    $scope.save = function() {
        $scope.user.$save().then( function() {
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
