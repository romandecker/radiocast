"use strict";

var app = angular.module( "radiocast" );

app.directive('navMenu', function($location) {
    return function(scope, element, attrs) {
        var links = element.find('a'),
            onClass = attrs.navMenu || 'active',
            routePattern,
            link,
            url,
            currentLink,
            urlMap = {},
            i;

        if (!$location.$$html5) {
            routePattern = /^#[^/]*/;
        }

        for( i = 0; i < links.length; i++ ) {
            link = angular.element(links[i]);
            url = link.attr('href');

            if( $location.$$html5 ) {
                urlMap[url] = link.parent();
            } else {
                urlMap[url.replace(routePattern, '')] = link.parent();
            }
        }

        scope.$on('$routeChangeStart', function() {

            angular.forEach( urlMap, function( value, key ) {
                
                var rgx = new RegExp( "^" + key + ".*$" );
                if( $location.path().match( rgx ) ) {

                    var pathLink = value;
                    if (pathLink) {
                        if (currentLink) {
                            currentLink.removeClass(onClass);
                        }
                        currentLink = pathLink;
                        currentLink.addClass(onClass);
                    }
                }
            } );

        });
    };
});
