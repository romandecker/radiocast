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

        var salt = rand( 512, 36 );
        if( this.isNew() ) {
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
    }
}, {
    login: function( username, password ) {
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
                
                    //if password matches
                    var token = rand( 320, 36 );

                    return user.save(
                        { session: token },
                        { patch: true, transacting: tx }
                    );
                } else {
                    //password incorrect
                    return null;
                }
            } );
        } );
    }
} );

module.exports = User;
