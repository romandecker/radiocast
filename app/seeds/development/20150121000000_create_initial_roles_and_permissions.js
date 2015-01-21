'use strict';

exports.seed = function(knex, Promise) {
    return Promise.join(
        knex("permissions").del(),
        knex("roles").del(),
        knex("permissions_roles").del()
    ).then( Promise.join( 
        knex("permissions").insert( { id: 1, name: "manage_users" } )
    ) ).then( Promise.join( 
        knex("roles").insert( { id: 1, name: "admin" } )
    ) ).then( Promise.join(
        knex("permissions_roles" ).insert( { role_id: 1, permission_id: 1 } ) 
    ) );
};
