"use strict";

/* jshint camelcase: false */

require( "should" );
require( "assert" );
require( "expect.js" );
var request = require( "supertest" );
require( "sugar" );

var testsetup = require( "./testsetup" );
var Room = testsetup.models.Room;

var testData = testsetup.testData;

describe( "Room API", function() {

    before( function( done ) {
        done();
    } );

    beforeEach( function( done ) {
        //delete all Rooms in the database
        Room.query().del().then( done.bind( null, null ) );
    } );

    it( "should save a valid Room", function( done ) {
        
        var r = testData.rooms.a;

        request( testsetup.appUrl )
            .post( "/api/rooms" )
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

    function testPresence( fieldName ) {
        it( "should require " + fieldName + " to be present", function( done ) {

            var r = Object.clone( testData.rooms.a, true );
            delete r[fieldName];

            request( testsetup.appUrl )
                .post( "/api/rooms" )
                .send( r )
                .expect( 400 )
                .end( function( err, res ) {

                if( err ) { throw err; }

                res.body.should.have.property( fieldName );

                done();
            } );
        } );
    }
    
    testPresence( "name" );
    testPresence( "maxCap" );

    it( "should fail to delete non-existing room", function( done ) {
        
        request( testsetup.appUrl )
            .delete( "/api/rooms/4711" )
            .expect( 404 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            done();
        } );
    } );

    it( "should fail to update non-existing room", function( done ) {
        
        request( testsetup.appUrl )
            .put( "/api/rooms/4711" )
            .expect( 404 )
            .end( function( err, res ) {

            if( err ) { throw err; }

            done();
        } );
    } );

    it( "should successfully delete existing room", function( done ) {
        
        var a = new Room( testData.rooms.a );
        a.save( {}, {method: "insert"} ).then( function( a ) {
            
            request( testsetup.appUrl )
                .delete( "/api/rooms/" + a.id )
                .expect( 200 )
                .end( function( err, res ) {

                if( err ) { throw err; }
                
                done();
            } );

        } );
    } );

} );
