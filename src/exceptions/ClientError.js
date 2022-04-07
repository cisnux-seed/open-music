class ClientError extends Error {
  constructor(message, status, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.name = 'ClientError';
  }
}

module.exports = ClientError;
