"use strict";

var chai = require( "chai" );
var chaiAsPromised = require( "chai-as-promised" );
chai.use( chaiAsPromised );

module.exports.login = function( username, password ) {

    element( by.css("form.login-form") ).isPresent().then( function( present ) {

        if( !present ) {

            var loginLink = element( by.css("a.login") );
            return loginLink.isPresent().then( function( present ) {
                if( present ) {
                    return loginLink.click();
                } else {
                    throw new Error( "Login link not found" );
                }
            } );
        }
    } );

    element( by.model("email") ).sendKeys( username );
    element( by.model("password") ).sendKeys( password );
    element( by.css("form.login-form input[type='submit']") ).click();
};

module.exports.logout = function() {

    var logoutLink = element( by.css("a.logout") );
    
    return logoutLink.isPresent().then( function( present ) {
        return logoutLink.click();
    } );
};
