"use strict";

var Checkit = require( "checkit" );
var bookshelf = require( "./BaseModel" );
var crypto = require( "crypto" );
var rand = require( "csprng" );

var validator = new Checkit( {
    email: ["required", "email"]
} );

var User = bookshelf.model( "User", {
    tableName: "users",

    validate: function() {
        return validator.run( this.attributes );
    },


    saving: function( model, attrs, options ) {
        
        var ret = bookshelf.Model.prototype.saving.apply( this, arguments );

        var salt;
        if( this.isNew() ) {
            salt = rand( 512, 36 );
            model.set( "salt", salt );
        } else {
            salt = model.get( "salt" );
        }

        if( this.changed.password ) {
            var sha = crypto.createHash( "sha512" );
            sha.update( this.changed.password + salt );
            
            model.set( "pwhash", sha.digest( "hex" ) );
        }

        return ret;
    },

    hasPassword: function( password ) {
        
        var sha = crypto.createHash( "sha512" );
        sha.update( password + this.get("salt") );

        var digest = sha.digest( "hex" );

        return digest === this.get("pwhash");
    },
    logout: function() {
        return this.save( { session: null }, { patch: true } );
    },
    pruneSensitiveData: function() {
        return this.omit( "pwhash",
                          "salt",
                          "session",
                          "deleted" );
    }
}, {
    login: function( username, password, sessionId ) {
        return bookshelf.transaction( function( tx ) {

            //search for the user with the given username
            return User.where(
                { email: username }
            ).fetch(
                { transacting: tx }
            ).then( function( user ) {

                if( !user ) {
                    //if the no user with the username exists
                    return null;
                }

                if( user.hasPassword(password) ) {
                
                    return user.save(
                        { session: sessionId },
                        { patch: true, transacting: tx }
                    ).return( user );
                } else {
                    //password incorrect
                    return null;
                }
            } );
        } );
    },

    bySession: function( token ) {
        return User.where(
            { session: token }
        ).fetch().then( function( user ) {
            return user;
        } );
    }
} );

module.exports = User;
