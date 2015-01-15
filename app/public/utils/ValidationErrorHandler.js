"use strict";

var app = angular.module( "yourapp" );

app.factory( "ValidationErrorHandler", function( $q, ValidationError ) {

    return {
        handle: function( form, promise ) {
            
            promise.then( function() {
                
                angular.forEach( form, function(fieldInfo, field) {
                    
                    if( field.match(/^[^\$].*/) ) {

                        angular.forEach( form[field].$error,
                            function( wtf, message ) {
                            form[field].$setValidity( message, true );

                        } );
                    }
                } );
            }, function( error ) {
                
                if( error instanceof ValidationError )  {
                    
                    angular.forEach( error.validationResults, 
                        function( messages, field ) {
                        
                        angular.forEach( messages, function(message) {
                            form[field].$dirty = true;
                            form[field].$setValidity( message, false );
                        } );
                    } );
                } else {
                    //re-throw other errors
                    return $q.reject( error );
                }
            } );
        }
    };
} );
