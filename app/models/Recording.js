"use strict";

var Checkit = require( "checkit" );
var bookshelf = require( "./BaseModel" );
var BPromise = require( "bluebird" );
var fs = BPromise.promisifyAll( require( "fs-extra" ) );
var path = require( "path" );
var dateformat = require( "dateformat" );
var spawn = require( "child_process" ).spawn;

// make sure the role-model is loaded

var validator = new Checkit( {
} );

var Recording = bookshelf.model( "Recording", {
    tableName: "recordings",

    validate: function() {
        return validator.run( this.toJSON( { shallow: true } ) );
    },

    show: function() {
        return this.belongsTo( "Show" );
    },

    start: function() {

        var self = this;
        
        self.show().fetch().then( function( show ) {

            var url = show.get( "url" );
            var duration = show.get( "duration" );
            var showId = show.get( "id" ) + "";
            var fileName = dateformat( "yyyy-mm-dd-HH-MM-ss" );

            var filepath = path.join( "data",
                                  "recordings",
                                  showId );

            console.log( "saving as", fileName + ".aac" );
            self.save(
                {
                    state: "RECORDING",
                    file: fileName + ".aac"
                },
                { patch: true }
            ).then( function( rec ) {

                console.log( "file:", rec.get("file") );
                fs.mkdirpAsync( filepath ).then( function() {

                    filepath = path.join( filepath, fileName );

                    console.log( "Now recording", filepath );

                    var record = spawn(
                        "scripts/record.sh",
                        [url, filepath, duration]
                    );

                    record.stderr.on( "data", function( data ) {
                        process.stderr.write( data );
                    } );

                    record.on( "exit",
                               self.recordingDone.bind(self, filepath) );
                } );
            } );
        } );
    },

    recordingDone: function( filepath, code ) {

        var self = this;
        console.log( "Recording finished with exit code", code );
        if( code === 0 ) {
            self.save(
                { state: "CONVERTING" },
                { patch: true }
            ).then( function( rec ) {
                
                console.log( "Starting conversion..." );
                var convert = spawn(
                    "scripts/convert.sh",
                    [filepath + ".aac", filepath + ".mp3"]
                );

                convert.on( "exit", self.conversionDone.bind(self, filepath) );
            } );

        } else {
            console.error( "Recording failed" );
        }
    },

    conversionDone: function( filepath, code ) {
        console.log( "Converting finished with exit code", code );

        var self = this;
        if( code === 0 ) {
            
            fs.unlinkAsync( filepath + ".aac" ).then( function() {
                console.log( ".aac file deleted" );

                var mp3name = path.basename( filepath ) + ".mp3";

                self.save(
                    { state: "READY",
                      file: mp3name },
                    { patch: true }
                );
            } );

        } else {
            console.error( "Conversion failed" );
        }
    }

}, {

} );

module.exports = Recording;


