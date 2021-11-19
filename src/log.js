const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // Write all logs with level `info` and below to `combined.log`
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
        prettyPrint: true,
        colorize: true,
        timestamp: true
    }));
}

module.exports = logger