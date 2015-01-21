'use strict';

var crypto = require( "crypto" );
var rand = require( "csprng" );


exports.seed = function(knex, Promise) {

    var salt = rand( 512, 36 );

    var sha = crypto.createHash( "sha512" );
    sha.update( "admin" + salt );

    return Promise.join(
        // Deletes ALL existing entries
        knex('users').del(), 

        // Inserts seed entries
        knex('users').insert( {
            id: 1,
            email: 'admin@example.org',
            pwhash: sha.digest("hex"),
            salt: salt
        } ),

        knex("roles_users").insert( {
            role_id: 1,
            user_id: 1
        } )
    );
};
