"use strict";

var app = angular.module( "yourapp" );

app.factory( "AuthenticationService", function( $http ) {

    var token = null;

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
                    token = response.token;
                    return token;
                } else {
                    throw response;
                }
            } );
        },

        logout: function() {

        }
    };
} );
