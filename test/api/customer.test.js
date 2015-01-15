"use strict";

/* jshint camelcase: false */

require( "should" );
require( "assert" );
require( "expect.js" );
require( "sugar" );

var request = require( "supertest" );

var testsetup = require( "./testsetup" );
var Customer = testsetup.models.Customer;
var Reservation = testsetup.models.Reservation;

var utils = require( "./testutils" );
var testData = testsetup.testData;
var bookshelf = testsetup.app.get( "bookshelf" );

describe( "Customer API", function() {

    before( function( done ) {
        done();
    } );

    var cleanup = function( done ) {
        //delete all Customers and Reservations in the database

        // first, delete all customer <-> reservation relations
        bookshelf.knex( "customers_reservation" ).del().then( [
            // now all customers and reservations can then be deleted
            Customer.query().del(),
            Reservation.query().del()
        ] ).then( done.bind(null, null) );
    };


    beforeEach( cleanup );
    //after( cleanup );

    it( "should save a valid customer", function( done ) {
        
        var c = testData.customers.john;

        request( testsetup.appUrl )
            .post( "/api/customers" )
            .send( c )
            .expect( 201 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            res.body.should.have.property( "id" );
            res.body.should.have.property( "created_at" );
            res.body.should.have.property( "updated_at" );

            delete res.body.id;
            delete res.body.created_at;
            delete res.body.updated_at;

            res.body.should.eql( c );

            done();
        } );

    } );

    var tester = new utils.PresenceTester( "/api/customers",
                                           testData.customers.john );
    
    tester.require( "firstName" );
    tester.require( "lastName" );
    tester.require( "company" );
    tester.require( "email" );

    it( "should require email to be a valid email", function( done ) {

        var c = Object.clone( testData.customers.john, true );
        c.email = "asdf";

        request( testsetup.appUrl )
            .post( "/api/customers" )
            .send( c )
            .expect( 400 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            res.body.should.have.property( "email" );
            
            done();
        } );
    } );

    it( "should perform validations on updates as well", function( done ) {
        
        var john = new Customer( testData.customers.john );
        john.save().then( function( savedJohn ) {
            
            var c = Object.clone( testData.customers.john, true );
            c.email = "asdf";

            request( testsetup.appUrl )
                .put( "/api/customers/" + savedJohn.id )
                .send( c )
                .expect( 500 )
                .end( function( err, res ) {

                if( err ) { throw err; }

                res.body.should.have.property( "email" );
                
                done();
            } );

        } );

    } );

    it( "should fail to delete non-existing customers", function( done ) {
        
        request( testsetup.appUrl )
            .delete( "/api/customers/4711" )
            .expect( 404 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            done();
        } );
    } );

    it( "should fail to update non-existing customers", function( done ) {
        
        request( testsetup.appUrl )
            .put( "/api/customers/4711" )
            .expect( 404 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            done();
        } );
    } );

    it( "should successfully delete existing customers", function( done ) {
        
        var john = new Customer( testData.customers.john );
        john.save( {}, {method: "insert"} )
                               .then( function( savedJohn ) {
            
            request( testsetup.appUrl )
                .delete( "/api/customers/" + savedJohn.id )
                .expect( 200 )
                .end( function( err, res ) {

                if( err ) { throw err; }
                
                done();
            } );

        } );
    } );

} );
