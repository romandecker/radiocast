"use strict";

var app = angular.module( "radiocast" );

app.factory( "ValidationError", function() {

    function ValidationError( validationResults ) {
        this.validationResults = validationResults;
        this.message = "Validation failed";
    }

    ValidationError.prototype = Error.prototype;

    return ValidationError;
} );

app.factory( "UnauthorizedError", function() {

    return function() {
        function UnauthorizedError( message ) {
            this.message = message;
        }

        UnauthorizedError.prototype = Error.prototype;
    };
} );
