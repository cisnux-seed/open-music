const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message, status) {
    super(message, status, 401);
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
