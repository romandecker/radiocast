'use strict';

exports.up = function(knex, Promise) {

    return knex.schema.createTable( "users", function( table ) {

        table.increments();
        table.timestamps();
        table.string( "email" ).notNull().unique();
        table.string( "pwhash" ).notNull();
        table.string( "salt" ).notNull();
        table.string( "session" );
        table.boolean( "deleted" );

    } );
  
};

exports.down = function(knex, Promise) {

    return knex.schema.dropTable( "users" );
  
};
