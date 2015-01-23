var winston = require( "winston" );
var expressWinston = require( "express-winston" );

module.exports = {
    logger: expressWinston.logger( {
        transports: [
            new winston.transports.File( {
                filename: "logs/express.log"
            } )
        ]
    } ),
    db: {
        connection: {
            database: "radiocast_production",
        }
    }
};
