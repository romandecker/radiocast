"use strict";

var app = angular.module( "yourapp" );

app.directive( "searchbox", function() {
    return {
        restrict: "E",
        //require: "ngModel",
        templateUrl: "public/views/partials/fileupload.html",
        scope: {
            //value: "=ngModel",
        },
        link: function( scope, element, attrs, ngModel ) {

        }
    };
} );

