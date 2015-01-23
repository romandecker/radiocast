"use strict";

/* jshint expr: true */

var chai = require( "chai" );
var chaiAsPromised = require( "chai-as-promised" );
var chaiHttp = require( "chai-http" );
var testsetup = require( "./testsetup" );
var BPromise = require( "bluebird" );

chai.use( chaiAsPromised );
chai.use( chaiHttp );

var request = chai.request;
var expect = chai.expect;

request.addPromises( BPromise );

var User = require( "../../app/models/User" );
var bookshelf = require ( "../../app/models/BaseModel" );
var testutils = require( "./testutils" );

describe( "User Controller", function() {

    before( function( done ) {
        bookshelf.onSchemaLoaded( done.bind(null, null) );
    } );

    beforeEach( function() {
        return testutils.clearUsers().then( function() {
            return testutils.createUser( new User( {
                email: "asdf@asdf.com",
                password: "asdf"
            } ) );
        } );
    } );

    it( "should not allow listing users without login", function() {
        
        return request( testsetup.appUrl )
                .get( "/api/users/" )
                .send()
                .then( function( res ) {

            expect( res ).to.have.status( 401 );
        } );
    } );

    it( "should not allow fetching user information without login", function() {

        return request( testsetup.appUrl )
                .get( "/api/users/me" )
                .send()
                .then( function( res ) {

            expect( res ).to.have.status( 401 );
        } );
    } );

    it( "should block login with invalid password", function() {

        return request( testsetup.appUrl )
                .put( "/api/auth/login" )
                .send( { username: "asdf@asdf.com", password: "qwer" } )
                .then( function( res ) {

            expect( res ).to.have.status( 400 );
        } );
    } );

    it( "should block login with invalid username", function() {

        return request( testsetup.appUrl )
                .put( "/api/auth/login" )
                .send( { username: "qwer@qwer.com", password: "asdf" } )
                .then( function( res ) {

            expect( res ).to.have.status( 400 );
        } );
    } );

    it( "should block login without password", function() {
        
        return request( testsetup.appUrl )
                .put( "/api/auth/login" )
                .send( { username: "asdf@asdf.com" } )
                .then( function( res ) {

            expect( res ).to.have.status( 400 );
        } );
    } );

    it( "should enable login with valid credentials", function() {

        return request( testsetup.appUrl )
                .put( "/api/auth/login" )
                .send( { username: "asdf@asdf.com", password: "asdf" } )
                .then( function( res ) {

            expect( res ).to.have.status( 200 );
            expect( res ).to.have.header( "set-cookie" );
        } );
    } );

    it( "should not return info when trying to fetch own data", function() {
        
        return request( testsetup.appUrl )
                .get( "/api/users/me" )
                .then( function( res ) {

            expect( res ).to.have.status( 401 );
        } );
    } );

    describe( "when logged in", function() {

        // save session in agent
        var agent = request.agent( testsetup.appUrl );

        beforeEach( function() {
            return testutils.login( agent, "asdf@asdf.com", "asdf" );
        } );

        afterEach( function() {
            return testutils.logout( agent );
        } );

        it( "should enable fetching own user information", function() {
            
            return agent
                    .get( "/api/users/me" )
                    .send()
                    .then( function( res ) {

                expect( res ).to.have.status( 200 );
                expect( res ).to.be.json;

                expect( res.body.email ).to.equal( "asdf@asdf.com" );
            } );
        } );

    } );

    describe( "when logged in as a user who can not manage_users", function() {

        // save session in agent
        var agent = request.agent( testsetup.appUrl );

        beforeEach( function() {
            return testutils.login( agent, "asdf@asdf.com", "asdf" );
        } );

        afterEach( function() {

            // logout
            return agent
                .put( "/api/auth/logout" )
                .send()
                .then( function( res ) {

                expect( res ).to.have.status( 200 );
            } );
            
        } );

        it( "should block listing users", function() {
            
            return agent
                    .get( "/api/users" )
                    .send()
                    .then( function( res ) {

                expect( res ).to.have.status( 403 );
            } );
        } );

        it( "should block creating users", function() {

            return agent
                    .post( "/api/users" )
                    .send( { email: "zxcv@zxcv.com", password: "zxcv" } )
                    .then( function( res ) {

                expect( res ).to.have.status( 403 );
            } );
        } );

        describe( "when changing password", function() {
            it( "be possible to change one's own password", function() {
                return agent
                        .put( "/api/users/me/changePassword" )
                        .send( {
                            oldPassword: "asdf",
                            newPassword: "qwer"
                        } )
                        .then( function( res ) {

                    expect( res ).to.have.status( 200 );
                } );
            } );

            it( "not be possible to change one's own password " + 
                "when specifying a wrong current password", function() {
                return agent
                        .put( "/api/users/me/changePassword" )
                        .send( {
                            oldPassword: "zxcv",
                            newPassword: "qwer"
                        } )
                        .then( function( res ) {

                    expect( res ).to.have.status( 400 );
                } );
            } );


            it( "not be possible to change someone else's password",
                function() {

                return testutils.createUser( new User( {
                    email: "qwer@qwer.com",
                    password: "qwer"
                } ) ).then( function( user ) {

                    return agent
                            .put( "/api/users/" + 
                                    user.get("id") + "/changePassword" )
                            .send( {
                                oldPassword: "asdf",
                                newPassword: "qwer"
                            } )
                            .then( function( res ) {

                        expect( res ).to.have.status( 403 );
                    } );
                } );

            } );

        } );

    } );

    describe( "when logged in as a user who can manage_users", function() {

        // save session in agent
        var agent = request.agent( testsetup.appUrl );

        beforeEach( function() {

            return BPromise.join(
                testutils.clearUsers(),
                testutils.clearRoles()
            ).then( function() {
                return testutils.createUser(
                    new User( {
                        email: "usermanager@asdf.com",
                        password: "asdf"
                    } ),
                    [ {
                        name: "usermanager",
                        permissions: ["manage_users"]
                    } ]
                );
            } ).then( function( user ) {

                return testutils.login( agent, "usermanager@asdf.com", "asdf" );
            } );
            
        } );

        afterEach( function() {
            // logout
            return agent
                .put( "/api/auth/logout" )
                .send()
                .then( function( res ) {

                expect( res ).to.have.status( 200 );
            } );
        } );

        it( "should allow listing users", function() {
            
            return agent
                    .get( "/api/users" )
                    .send()
                    .then( function( res ) {

                expect( res ).to.have.status( 200 );
            } );
        } );

        it( "should allow creating users", function() {

            return agent
                    .post( "/api/users" )
                    .send( { email: "zxcv@zxcv.com", password: "zxcv" } )
                    .then( function( res ) {

                expect( res ).to.have.status( 201 );
            } );
        } );

        it( "should not allow creating a user with invalid email", function() {

            return agent
                    .post( "/api/users" )
                    .send( { email: "not an email", password: "zxcv" } )
                    .then( function( res ) {

                expect( res ).to.have.status( 400 );
            } );
        } );

        it( "should return 404 for non-existing users", function() {

            return agent
                    .get( "/api/users/nope" )
                    .then( function( res ) {

                expect( res ).to.have.status( 404 );
            } );
        } );

        describe( "when changing password", function() {
            it( "be possible to change one's own password", function() {
                return agent
                        .put( "/api/users/me/changePassword" )
                        .send( {
                            oldPassword: "asdf",
                            newPassword: "qwer"
                        } )
                        .then( function( res ) {

                    expect( res ).to.have.status( 200 );
                } );
            } );

            it( "be possible to change someone else's password",
                function() {

                return testutils.createUser( new User( {
                    email: "qwer@qwer.com",
                    password: "qwer"
                } ) ).then( function( user ) {

                    return agent
                            .put( "/api/users/" + 
                                    user.get("id") + "/changePassword" )
                            .send( {
                                newPassword: "asdf"
                            } )
                            .then( function( res ) {

                        expect( res ).to.have.status( 200 );

                        return User.where(
                            { email: "qwer@qwer.com" }
                        ).fetch().then( function( user ) {
                            expect( user ).to.exist;

                            expect(user.hasPassword("qwer")).to.equal( false );
                            expect(user.hasPassword("asdf")).to.equal( true );
                        } );
                    } );
                } );

            } );

            it( "not be possible to change a non-existant user's password",
                function() {

                return agent
                        .put( "/api/users/nope/changePassword" )
                        .send( {
                            newPassword: "asdf"
                        } )
                        .then( function( res ) {

                    expect( res ).to.have.status( 404 );

                } );

            } );

        } );

    } );
} );
