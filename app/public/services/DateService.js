"use strict";

var app = angular.module( "yourapp" );

app.factory( "DateService", function( $filter ) {

    return {
        parseDate: function( datestr ) {
            if( !datestr ) {
                return;
            }
            var match = datestr.match( /(\d+)-(\d+)-(\d+)/ );
            var date = {
                year: match[1],
                month: match[2],
                day: match[3]
            };

            var ret = new Date( date.year, date.month - 1, date.day);
            ret.setTime( ret.getTime() - ret.getTimezoneOffset() * 60 * 1000 );

            return ret;
        },

        formatDate: function( dateobj ) {
            
            if( !dateobj ) {
                return null;
            }

            var padLeft = $filter( "padLeft" );
            
            return padLeft( dateobj.getFullYear(), 4 ) + "-" +
                   padLeft( (dateobj.getMonth() + 1), 2 ) + "-" +
                   padLeft( dateobj.getDate(), 2 );
        },

        today: function() {
            
            var now = new Date();
            
            now.setHours( 0 );
            now.setMinutes( 0 );
            now.setSeconds( 0 );
            now.setMilliseconds( 0 );

            return now;
        }
    };
} );
