"use strict";

var app = angular.module( "yourapp" );

app.directive( "searchbox", function() {
    return {
        restrict: "E",
        require: "ngModel",
        transclude: true,
        templateUrl: "public/views/partials/searchbox.html",
        scope: {
            value: "=ngModel",
            throttle: "@"
        },
        link: function( scope, element, attrs, ngModel ) {

            scope.throttle = scope.throttle || 1000;
            
            if( angular.isDefined(attrs.autofocus) ) {
                var input = element[0].querySelector( "input" );
                input.setAttribute( "autofocus", "autofocus" );
            }

            var lastEventFired = 0;
            var timeout;
            var skip = false;

            scope.onChange = function() {
                var now = new Date();

                var diff = now - lastEventFired;
                if( diff > scope.throttle ) {

                    if( timeout ) {
                        clearTimeout( timeout );
                        timeout = null;
                    }

                    skip = true;
                    scope.value = scope.text;
                    lastEventFired = new Date();
                } else {
                    if( timeout ) {
                        clearTimeout( timeout );
                    }

                    timeout = setTimeout( function() {
                        skip = true;
                        scope.value = scope.text;
                        scope.$apply();
                        lastEventFired = new Date();
                    }, scope.throttle - diff );
                }
            };

            scope.$watch( "value", function() {
                if( !skip ) {
                    scope.text = scope.value;
                    skip = false;
                }
            } );
        }
    };
} );
