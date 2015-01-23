"use strict";

var Role = require( "../../app/models/Role" );
var Permission = require( "../../app/models/Permission" );
var bookshelf = require( "../../app/models/BaseModel" );
var BPromise = require( "bluebird" );

var chai = require( "chai" );
var chaiAsPromised = require( "chai-as-promised" );
var chaiHttp = require( "chai-http" );
chai.use( chaiAsPromised );
chai.use( chaiHttp );
var expect = chai.expect;

module.exports.createRole = function( name, permissions ) {

    permissions = permissions || [];

    return Role.where( { name: name } ).fetch( {
        withRelated: "permissions"
    } ).then( function( role ) {
        if( !role ) {
            role = new Role( { name: name } );
            return role.save().then( function() {
                return role.fetch( {
                    withRelated: "permissions"
                } );
            } );
        } else {
            console.log( "role found" );
            return role;
        }
    } ).then( function( role ) {
        
        return BPromise.all( role.permissions().map( function( permission ) {
            return role.permissions().detach( permission );
        } ) ).then( BPromise.all( permissions.map( function( name ) {
            return module.exports.createPermission(
                name
            ).then( function( permission ) {
                return role.permissions().attach( permission );
            } );
        } ) ) ).return( role );

    } );
};

module.exports.createPermission = function( name ) {
    
    return Permission.where(
        { name: name }
    ).fetch().then( function( permission ) {
        if( !permission ) {
            permission = new Permission( { name: name } );
            return permission.save();
        } else {
            return permission;
        }
    } );
};

module.exports.clearRoles = function() {
    
    return bookshelf.knex( "roles" ).del();
};

module.exports.clearUsers = function() {
    return bookshelf.knex( "users" ).del();
};

module.exports.createUser = function( user, roles ) {
    
    roles = roles || [];

    return user.save().then( function( user ) {
        return BPromise.all( roles.map( function( role ) {
            return module.exports.createRole(
                role.name,
                role.permissions
            ).then( function( role ) {
                return user.roles().attach( role );
            } );
        } ) ).return( user );
    } );
};

module.exports.login = function( agent, username, password ) {
    
    // login
    return agent
        .put( "/api/auth/login" )
        .send( { username: username, password: password } )
        .then( function( res ) {
        expect( res ).to.have.status( 200 );
    } );
};

module.exports.logout = function( agent ) {

    // logout
    return agent
        .put( "/api/auth/logout" )
        .send()
        .then( function( res ) {
        expect( res ).to.have.status( 200 );
    } );
};
