"use strict";

var app = angular.module( "radiocast" );

app.factory( "AuthenticationService", function( $http,
                                                $rootScope,
                                                $cookies,
                                                $q ) {

    var user = null;
    var permissions = [];

    return {
        login: function( username, password ) {
            return $http( {
                method: "PUT",
                url: "/api/auth/login",
                data: {
                    username: username,
                    password: password
                }
            } ).then( function( response ) {
                if( response.status === 200 ) {
                    $rootScope.$broadcast( "login", response.token );
                    return response.token;
                } else {
                    throw response;
                }
            } );
        },

        logout: function() {

            $http( {
                method: "PUT",
                url: "/api/auth/logout"
            } ).then( function( response ) {
                if( response.status === 200 ) {
                    user = null;
                    delete $cookies.session;
                    $rootScope.$broadcast( "logout" );
                } else {
                    throw response;
                }
            } );
        },
        getPermissions: function() {
            return $http( {
                method: "GET",
                url: "/api/users/me"
            } ).then( function( response ) {
                var user = response.data;
                permissions = [];

                angular.forEach( user.roles, function( role ) {
                    angular.forEach( role.permissions, function( permission ) {
                        permissions.push( permission.name );
                    } );
                } );

                return permissions;
            } );
        },
        isAllowed: function( permission ) {

            if( permissions.indexOf(permission) < 0 ) {
                return true;
            } else {
                return false;
            }

        }
    };
} );
