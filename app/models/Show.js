"use strict";

var Checkit = require( "checkit" );
var bookshelf = require( "./BaseModel" );
var sched = require( "node-schedule" );

// make sure the role-model is loaded
require( "./Role" );
require( "./Recording" );

var activeJobs = {};

var validator = new Checkit( {
    name: ["required"],
    url: ["required"],
    schedule: ["required"],
    duration: ["number", "required"]
} );

var Show = bookshelf.model( "Show", {
    tableName: "shows",

    validate: function() {
        return validator.run( this.toJSON( { shallow: true } ) );
    },

    recordings: function() {
        return this.hasMany( "Recording" );
    },

    schedule: function() {
        
        var url = this.get( "url" );
        var self = this;
        var job = sched.scheduleJob( this.get("schedule"), function() {
            return self.recordings().create( {
                state: "SCHEDULED"
            } ).then( function( recording ) {
                recording.start();
            } );

        } );

        console.log( "Scheduled", this.get("name"), url );
        activeJobs[ this.get("id") ] = job;
    },

    unschedule: function() {

        var id = this.get( "id" );
        var job = activeJobs[id];

        if( job ) {
            console.log( "Unscheduled", this.get("name"), this.get("url") );
            job.cancel();
            delete activeJobs[id];
        }
    }

}, {

    rescheduleAll: function() {
        
        Show.fetchAll().then( function( shows ) {
            shows.forEach( function( show ) {
                show.unschedule();
                show.schedule();
            } );
        } );
    }

} );

module.exports = Show;

