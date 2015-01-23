"use strict";

var app = angular.module( "radiocast" );

app.factory( "User", function( $Model,
                               $http ) {

    return $Model.extend(
        {
            name: "User",
            url: "/api/users",
        },
        {
            changePassword: function( oldpw, newpw ) {

                var self = this;
                
                return $http( {
                    method: "PUT",
                    url: "/api/users/" + this.id + "/changePassword",
                    data: {
                        oldPassword: oldpw,
                        newPassword: newpw
                    }
                } ).then( function( response ) {

                    if( response.status === 200 ) {
                        return self;
                    } else {
                        throw response;
                    }

                } );
            },

            // checks if the user has the specified role
            is: function( role ) {
                
                return this.roles.some( function( r ) {
                    return r.name === role;
                } );
            },

            // checks if the user has the specified permission
            // Note that the user must be loaded with roles and permissions for
            // this to work
            can: function( permission ) {
                
                return this.roles.some( function( role ) {
                    return role.permissions.some( function( p ) {
                        return p.name === permission;
                    } );
                } );
            }
        },
        {
            fetchLoggedInUser: function() {
                
                var self = this;
                return $http( {
                    method: "GET",
                    url: "/api/users/me"
                } ).then( function( response ) {
                    if( response.status === 200 ) {
                        return self.$makeObjectFromResponse( response.data );
                    } else {
                        throw response;
                    }
                } );
            }
        }
    );
} );
