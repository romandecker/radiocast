var winston = require( "winston" );
var expressWinston = require( "express-winston" );

module.exports = {
    logger: expressWinston.logger( {
        transports: [
            new winston.transports.Console( {
                colorize: true
            } )
        ],
        msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}}",
        meta: false
    } ),
    db: {
        connection: {
            database: "yourapp_development"
        }
    }
};
