"use strict";

var chai = require( "chai" );
var chaiAsPromised = require( "chai-as-promised" );
chai.use( chaiAsPromised );
var expect = chai.expect;

var User = require( "../../app/models/User" );
var apiutils = require( "../api/testutils" );
//var e2eutils = require( "./testutils" );

describe( "homepage", function() {
    beforeEach( function() {
        browser.get( "/" );
    } );

    it( "should have a title", function() {
        return expect( browser.getTitle() ).to.eventually.equal( "Radiocast" );
    } );

    it( "should display a login dialog right away", function() {
        
        return expect(
            element( by.model("email") ).isPresent()
        ).to.eventually.equal( true );
    } );

    describe( "when trying to log in", function() {

        beforeEach( function( done ) {

            apiutils.clearUsers().then( function() {
                return apiutils.createUser( new User( {
                    email: "asdf@asdf.com",
                    password: "asdf"
                } ) );
            } ).finally( done );
        } );

        afterEach( function( done ) {
            var elem = element( by.css( "a.logout" ) );

            elem.isPresent().then( function( present ) {

                if( present ) {
                    elem.click().then( done );
                } else {
                    done();
                }
            } );
        } );

        it( "should not be able to log in with incorrect credentials",
            function() {

            element( by.model("email") ).sendKeys( "asdf@asdf.com" );
            element( by.model("password") ).sendKeys( "qwer" );
            element( by.css("form.login-form input[type='submit']") ).click();

            expect(
                element( by.css("form.login-form") ).isPresent()
            ).to.eventually.equal( true );

            expect(
                element(
                    by.css("form.login-form div.alert-danger")
                ).isPresent()
            ).to.eventually.equal( true );
        } );

        it( "should be able to log in with correct credentials",
            function(done) {

            element( by.model("email") ).sendKeys( "asdf@asdf.com" );
            element( by.model("password") ).sendKeys( "asdf" );
            element( by.css("form.login-form input[type='submit']") ).click();

            expect(
                element( by.css("form.login-form") ).isPresent()
            ).to.eventually.equal( false );
        } );

    } );

} );
