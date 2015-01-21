'use strict';

exports.up = function(knex, Promise) {
  
    return Promise.join(
        knex.schema.createTable( "roles", function( table ) {

            table.increments();
            table.timestamps();

            table.string( "name" ).unique().notNull();
        } ),

        knex.schema.createTable( "permissions", function( table ) {
            table.increments();
            table.string( "name" ).unique().notNull();
        } )
    ).then( Promise.join(

        knex.schema.createTable( "permissions_roles", function( table ) {
            table.increments();
            table.integer( "role_id" ).unsigned()
                                      .references( "roles.id" )
                                      .onDelete( "CASCADE" );
            
            table.integer( "permission_id" ).unsigned()
                                            .references( "permissions.id" )
                                            .onDelete( "CASCADE" );
        } ),

        knex.schema.createTable( "roles_users", function( table ) {
            table.increments();
            table.timestamps();
            table.integer( "role_id" ).unsigned()
                                      .references( "roles.id" )
                                      .onDelete( "CASCADE" );

            table.integer( "user_id" ).unsigned()
                                      .references( "users.id" )
                                      .onDelete( "CASCADE" );
        } )
    ) );
};

exports.down = function(knex, Promise) {
  
    return Promise.join(
        knex.schema.dropTable( "roles_users" ),
        knex.schema.dropTable( "permissions_roles" )
    ).then( Promise.join(
        knex.schema.dropTable( "permissions" ),
        knex.schema.dropTable( "roles" )
    ) );

};
