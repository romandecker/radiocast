"use strict";

var app = angular.module( "yourapp" );

app.directive( "paginated", function() {
    return {
        restrict: "E",
        require: "ngModel",
        transclude: true,
        templateUrl: "public/views/partials/paginated.html",
        scope: {
            collection: "=ngModel",
            page: "=",
            perPage: "@"
        },
        link: function( scope, element, attrs, ngModel ) {

        }
    };
} );
