"use strict";

var app = angular.module( "yourapp" );

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
            }
        }
    );
} );
