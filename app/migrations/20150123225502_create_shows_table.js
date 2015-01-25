"use strict";

exports.up = function(knex, Promise) {
  
    return knex.schema.createTable( "shows", function( table ) {

        table.increments();
        table.timestamps();

        table.string( "name" ).notNull();
        table.string( "url" ).notNull();
        table.string( "schedule" ).notNull();
        table.integer( "duration" ).unsigned().notNull();
    } );
  
};

exports.down = function(knex, Promise) {
  
    return knex.schema.dropTable( "shows" );
};
