"use strict";

var CheckitError = require( "checkit" ).Error;
var BaseController = require( "./BaseController" );
var Show = require( "../models/Show" );
var _ = require( "underscore" );
var RSS = require( "rss" );

module.exports = BaseController.extend( {

    Model: Show,

    pagination: {
        type: "always",
        perPage: 50
    },

    create: function( req, res ) {
        var data = _.extend( {}, req.body, req.query );

        Show.forge( data ).save().then( function( savedShow ) {
            savedShow.schedule();
            res.status( 201 ).json( savedShow );
        } ).catch( CheckitError, function( error ) {
            res.status( 400 ).json( error );
        } ).catch( function(error) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    },

    update: function( req, res ) {

        var id = req.params.id;
        var data = _.extend( {}, req.body, req.query );

        this.Model.where( { id: id } ).fetch().then( function( result ) {
            if( !result ) {
                res.status( 404 ).send();
            } else {
                return result.save(
                    data,
                    { patch: true }
                ).then( function( savedShow ) {
                    res.status( 200 ).json( savedShow );

                    savedShow.unschedule();
                    savedShow.schedule();
                } );
            }
        } ).catch( CheckitError, function( error ) {
            res.status( 400 ).json( error );
        } ).catch( function( error ) {
            console.error( error );
            res.status( 500 ).json( error );
        } );
    },

    rss: function( req, res ) {

        var showId = req.params.id;

        Show.where( { id: showId } ).fetch( {
            withRelated: "recordings"
        } ).then( function( show ) {

            var showName = show.get( "name" );
            var feed = new RSS( {
                title: showName,
                description: "Automated recording of " + show.get( "url" ),
                feed_url: "/shows/" + showId + "/rss",
                site_url: "/"
            } );

            show.related( "recordings" ).forEach( function( recording ) {

                feed.item( {
                    title: showName +
                            " recording from " +
                            recording.get( "created_at" ),
                    date: recording.get( "created_at" ),
                    url: "/recordings/" + 
                            showId + "/" + 
                            recording.get( "file" )
                } );
            } );
        

            return feed.xml();
        } ).then( function( xml ) {
            
            res.set( "Content-Type", "text/xml" );
            res.send( xml );
        } );

    }

} );

