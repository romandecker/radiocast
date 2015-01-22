"use strict";

/* jshint expr: true */

var chai = require( "chai" );
var chaiAsPromised = require( "chai-as-promised" );

var expect = chai.expect;

chai.use( chaiAsPromised );

var User = require( "../../app/models/User" );
var bookshelf = require ( "../../app/models/BaseModel" );

describe( "User Model", function() {

    before( function( done ) {
        bookshelf.onSchemaLoaded( done.bind(null, null) );
    } );

    beforeEach( function() {
        return bookshelf.knex( "users" ).del();
    } );

    it( "should require a user's email", function() {
        var u = new User( {
            password: "asdf"
        } );

        return expect( u.save() ).to.eventually.be.rejected;
    } );

    it( "should validate a new user's email", function() {
        
        var u = new User( {
            email: "this isn't an e-mail"
        } );

        return expect( u.save() ).to.eventually.be.rejected;
    } );

    it( "should save valid users", function() {
        
        var u = new User( {
            email: "asdf@asdf.com",
            password: "asdf"
        } );

        return expect( u.save() ).to.eventually.be.fulfilled;
    } );

    it( "should correctly check passwords", function() {
        
        var u = new User( {
            email: "asdf@asdf.com",
            password: "asdf"
        } );

        return expect( u.save().then( function() {
            expect( u.hasPassword("qwer") ).to.be.false;
            expect( u.hasPassword("asdf") ).to.be.true;
        } ) ).to.eventually.be.fulfilled;
    } );

} );


