"use strict";

/* jshint expr: true */

describe( "User model", function() {

    var expect = chai.expect;

    beforeEach( module("yourapp") );

    afterEach( inject( function( $httpBackend ) {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    } ) );

    it( "should be able to get the currently logged in user",
        inject( function( $httpBackend, User ) {

        $httpBackend.when( "GET", "/api/users/me" )
                    .respond( {
            id: 123,
            email: "asdf@asdf.com"
        } );

        User.fetchLoggedInUser().then( function( user ) {
            expect( user ).to.exist;
            expect( user.id ).to.equal( 123 );
            expect( user.email ).to.equal( "asdf@asdf.com" );
        } );

        $httpBackend.flush();
        
    } ) );

} );

