"use strict";

/* jshint expr: true */

describe( "Basemodel", function() {

    beforeEach( module("yourapp") );

    afterEach( inject( function( $httpBackend ) {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    } ) );

    it( "should be extendable", inject( function( $Model ) {

        chai.expect( $Model.extend ).to.exist;
        var Customer = $Model.extend( {
            url: "/api/customers"
        } );

        chai.expect( Customer.$query ).to.exist;
        chai.expect( Customer.$get ).to.exist;

        var c = new Customer();

        chai.expect( c.$save ).to.exist;
        
    } ) );

    it( "should be able to get existing model instances",
        inject( function( $httpBackend, $Model ) {

        $httpBackend.when( "GET", "/api/customers/4711" )
                    .respond( { asdf: "yeah!" } );
        
        var Customer = $Model.extend( {
            url: "/api/customers"
        } );

        Customer.$get( 4711 ).then( function( c ) {
            chai.expect( c.asdf ).to.equal( "yeah!" );
        } );

        $httpBackend.flush();
    } ) );

    it( "should be able to construct new model instances and save them",
        inject( function( $httpBackend, $Model ) {

        var Customer = $Model.extend( {
            url: "/api/customers"
        } );

        var c = new Customer();

        chai.expect( c.$isNew ).to.equal( true );

        $httpBackend.when( "POST", "/api/customers" )
                    .respond( { id: 4711 } );
        $httpBackend.when( "PUT", "/api/customers/4711" )
                    .respond( { foo: "bar" } );

        c.$save().then( function() {
            chai.expect( c.$isNew ).to.equal( false );
            chai.expect( c.id ).to.equal( 4711 );

            c.$save().then( function() {
                chai.expect( c.$isNew ).to.equal( false );
                chai.expect( c.foo ).to.equal( "bar" );
            } );
        } );

        $httpBackend.flush();
    } ) );

    it( "should be able to query model instances",
        inject( function( $httpBackend, $Model ) {

        var Customer = $Model.extend( {
            url: "/api/customers"
        } );

        $httpBackend.when( "GET", "/api/customers?firstName=Homer" )
                    .respond( [] );

        Customer.$query( {firstName: "Homer"} ).then( function( customers ) {
            chai.expect( customers.$paginated ).to.equal( false );
        } );

        $httpBackend.flush();

        $httpBackend.when( "GET", "/api/customers?lastName=Simpson" )
                    .respond( {
                        page: 1,
                        totalCount: 1000,
                        items: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
                    } );

        Customer.$query( {lastName: "Simpson"} ).then( function( customers ) {
            chai.expect( customers.$paginated ).to.equal( true );
        } );

        $httpBackend.flush();

    } ) );
} );
