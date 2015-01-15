"use strict";

var testsetup = require( "./testsetup" );
var request = require( "supertest" );

module.exports.PresenceTester = function( url, validObject ) {

    this.require = function( fieldName ) {
        
        it( "should require " + fieldName + " to be present", function( done ) {

            var c = Object.clone( validObject, true );
            delete c[fieldName];

            request( testsetup.appUrl )
                .post( url )
                .send( c )
                .expect( 400 )
                .end( function( err, res ) {

                if( err ) { throw err; }

                res.body.should.have.property( fieldName );

                done();
            } );
        } );
    };
};
