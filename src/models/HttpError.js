const util = require('util');

function HttpError(statusCode, message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.name = this.constructor.name;
  this.statusCode = statusCode;
  this.message = message;
}

util.inherits(HttpError, Error);

module.exports = HttpError;