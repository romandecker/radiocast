"use strict";

/* jshint camelcase: false */

require( "should" );
require( "assert" );
require( "expect.js" );
var request = require( "supertest" );

var testsetup = require( "./testsetup" );
var utils = require( "./testutils" );
var Reservation = testsetup.models.Reservation;
var Customer = testsetup.models.Customer;
var bookshelf = testsetup.app.get( "bookshelf" );

var testData = testsetup.testData;

describe( "Reservation API", function() {

    before( function( done ) {
        done();
    } );

    beforeEach( function( done ) {
        //delete all Reservations in the database
        
        // first, delete all customer <-> reservation relations
        bookshelf.knex( "customers_reservation" ).del()
		.then(bookshelf.knex("room_reservation").del())
		.then( [
            // now all customers and reservations can then be deleted
            Customer.query().del(),
            Reservation.query().del()
        ] ).then( done.bind(null, null) );
    } );

    it( "should save a valid reservation", function( done ) {
       
        var r = testData.reservations.a;

        request( testsetup.appUrl )
            .post( "/api/reservations" )
            .send( r )
            .expect( 201 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            res.body.should.have.property( "id" );
            res.body.should.have.property( "created_at" );
            res.body.should.have.property( "updated_at" );

            delete res.body.id;
            delete res.body.created_at;
            delete res.body.updated_at;

            res.body.should.eql( r );

            done();
        } );

    } );

    var tester = new utils.PresenceTester( "/api/reservations",
                                           testData.reservations.a );

    tester.require( "from" );
    tester.require( "to" );

    it( "should perform validations on updates as well", function( done ) {
        
        var a = new Reservation( testData.reservations.a );
        a.save().then( function( savedJohn ) {
            
            var c = Object.clone( testData.reservations.a, true );
            c.discount = -1;

            request( testsetup.appUrl )
                .put( "/api/reservations/" + savedJohn.id )
                .send( c )
                .expect( 400 )
                .end( function( err, res ) {

                if( err ) { throw err; }

                res.body.should.have.property( "discount" );
                
                done();
            } );

        } );

    } );

    it( "should fail to delete non-existing reservation", function( done ) {
        
        request( testsetup.appUrl )
            .delete( "/api/reservations/4711" )
            .expect( 404 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            done();
        } );
    } );

    it( "should fail to update non-existing reservations", function( done ) {
        
        request( testsetup.appUrl )
            .put( "/api/reservations/4711" )
            .expect( 404 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            done();
        } );
    } );

    it( "should successfully delete existing reservations", function( done ) {
        
        var a = new Reservation( testData.reservations.a );
        a.save( {}, {method: "insert"} ).then( function( savedReservation ) {
            
            request( testsetup.appUrl )
                .delete( "/api/reservations/" + savedReservation.id )
                .expect( 200 )
                .end( function( err, res ) {

                if( err ) { throw err; }
                
                done();
            } );

        } );
    } );

} );
