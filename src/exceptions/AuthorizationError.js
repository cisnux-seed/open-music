const ClientError = require('./ClientError');

class AuthorizationError extends ClientError {
  constructor(message, status) {
    super(message, status, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;
