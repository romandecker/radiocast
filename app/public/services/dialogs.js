"use strict";

var app = angular.module( "radiocast" );

app.service( "dialogs", function( $modal ) {

    var baseOptions = {
        "confirm": {
            modalOptions: {
                backdrop: "static",
                keyboard: true,
                modalFade: true,
                templateUrl: "public/views/partials/confirm.html"
            },
            scope: {
                cancelText: "No, cancel",
                confirmText: "Yes, continue",
                title: "Confirm",
                text: "Are you sure?"
            }
        },
        "login": {
            modalOptions: {
                backdrop: "static",
                keyboard: false,
                modalFade: true,
                templateUrl: "public/views/partials/login.html"
            },
            controller: function( $scope,
                                  $timeout,
                                  $modalInstance,
                                  AuthenticationService ) {
                $timeout( function() {
                    $( "input#login-email" ).focus();
                }, 100 );

                $scope.login = function() {
                    AuthenticationService.login(
                        $scope.email,
                        $scope.password
                    ).then( function( token ) {
                        $modalInstance.close( token );
                    } ).catch( function( response ) {
                        if( response.status === 400 ) {
                            $scope.loginFailed = true;
                        } else {
                            console.log( response );
                            alert( "Unable to log in, please try again later" );
                        }
                    } );
                };
            }
        }
    };

    var dialogs = this;

    var methodNames = Object.keys( baseOptions );

    methodNames.forEach( function( methodName ) {

        var options = baseOptions[methodName];
        var modalOptions = angular.extend( {}, options.modalOptions );
        var scope = angular.extend( {}, options.scope );

        dialogs[methodName] = function( customOptions ) {
            
            customOptions = customOptions || {};
            if( typeof customOptions === "string" ) {
                customOptions = { text: customOptions };
            }

            var ctrl = customOptions.controller || options.controller;
            delete customOptions.controller;

            if( !ctrl ) {
                ctrl = function( $scope, $modalInstance ) {
                    angular.extend( $scope, scope );

                    $scope.ok = function() {
                        $modalInstance.close( true );
                    };

                    $scope.cancel = function() {
                        $modalInstance.dismiss( "cancel" );
                    };
                };
            }

            angular.extend( scope, customOptions );
            modalOptions.controller = ctrl;

            return $modal.open( modalOptions ).result;
        };
    } );


} );
