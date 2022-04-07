const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message, status) {
    super(message, status, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
