"use strict";

var app = angular.module( "radiocast" );

app.controller( "NavigationCtrl",
                function( $scope,
                          $rootScope,
                          dialogs,
                          AuthenticationService ) {

    var permissions = [];
    
    var reloadPermissions = function() {
        AuthenticationService.getPermissions().then( function( loadedPermissions ) {
            $scope.loggedIn = true;
            permissions = loadedPermissions;
        } ).catch( function() {
            $scope.loggedIn = false;
        } );
    };

    reloadPermissions();

    $rootScope.$on( "login", function() {
        $scope.loggedIn = true;
        reloadPermissions();
    } );

    $rootScope.$on( "logout", function() {
        $scope.loggedIn = false;
        permissions = [];
    } );

    $scope.can = function( permission ) {
        return permissions.indexOf( permission ) >= 0;
    };

    $scope.login = function() {
        dialogs.login();
    };

    $scope.logout = function() {
        AuthenticationService.logout();
    };

} );

