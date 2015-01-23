"use strict";

var app = angular.module( "radiocast" );

app.directive( "showsValidation", function() {
    return {
        restrict: "A",
        scope: {
            showsValidation: "@"   
        },
        link: function( scope, elem, attr, ctrl ) {
            scope.$parent.$watch( scope.showsValidation + ".$error", function(field) {

                var errorTag = elem.find( "p.error" );

                if( Object.keys(field).length > 0 ) {
                    var text = "";
                    //TODO find out what wtf actually does
                    angular.forEach( field, function( wtf, message ) {
                        text += message + ". ";
                    } );

                    elem.addClass( "has-error" );

                    if( !errorTag.length ) {
                        errorTag = $( '<p class="error"></p>' );
                        elem.append( errorTag );
                    }

                    console.log( text );
                    errorTag.text( text );
                } else {
                    elem.removeClass( "has-error" );
                    errorTag.remove();
                }
            }, true );
        }
    };
} );
