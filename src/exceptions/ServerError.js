class ServerError extends Error {
  constructor(message, status, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.name = 'ServerError';
  }
}

module.exports = ServerError;
