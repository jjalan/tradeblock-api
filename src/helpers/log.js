// See: https://github.com/winstonjs/winston
const winston = require('winston');

const fs = require('fs');

const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: 'info',
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new (winston.transports.File)({
      filename: `${logDir}/error.log`,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.json(),
      ),
      level: 'error',
    }),
    new (winston.transports.File)({
      filename: `${logDir}/combined.log`,
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.json(),
      ),
    }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple(),
    ),
  }));
}

module.exports = logger;
