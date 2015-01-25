"use strict";

exports.up = function(knex, Promise) {
  
    return knex.schema.createTable( "recordings", function( table ) {

        table.increments();
        table.timestamps();

        table.integer( "show_id" ).unsigned().references( "shows.id" );
        table.enum( "state", ["SCHEDULED",
                              "RECORDING",
                              "CONVERTING",
                              "READY"] );
        table.string( "file" );
    } );
  
};

exports.down = function(knex, Promise) {
  
    return knex.schema.dropTable( "recordings" );
};
