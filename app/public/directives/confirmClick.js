"use strict";

var app = angular.module( "yourapp" );

app.directive('confirmClick', function() {
    return {
        priority: -1,
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(e) {
                var message = attrs.confirmClick;
                if( message && !confirm(message) ){
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            });
        }
    };
} );
