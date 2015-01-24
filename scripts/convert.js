"use strict";

var spawn = require( "child_process" ).spawn;

// mplayer -ao pcm:fast:file=/dev/fd/3 -vo null -vc null input.aac 3>&1 1>&2 \
// | lame -V0 -q0 --vbr-new - output.mp3




var input = "input.aac";
var output = "output.mp3";

var mplayer = spawn(
    "mplayer",
    [ "-ao", "pcm:fast:file=/dev/fd/3",
      "-vo", "null",
      "-vc", "null",
      input
    ],
    {
        cwd: __dirname
    }
);
                                  
var lame = spawn(
    "lame",
    [ "-V0", "-q0",
      "--vbr-new",
      "-", output
    ],
    {
        cwd: __dirname
    }
);

mplayer.stdout.pipe( lame.stdin );

mplayer.stdout.on( "data", function(data) {
    process.stdout.write( data );
} );

mplayer.stderr.on( "data", function(data) {
    process.stdout.write( data );
} );

lame.stderr.on( "data", function(data) {
    process.stdout.write( data );
} );

lame.stdout.on( "data", function(data) {
    process.stdout.write( data );
} );
