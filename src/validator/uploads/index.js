const InvariantError = require('../../exceptions/InvariantError');
const { ImageHeaderSchema } = require('./schema');

const UploadsValidator = {
  validateImageHeaders: (payload) => {
    const validationResult = ImageHeaderSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message, 'fail');
    }
  },
};

module.exports = UploadsValidator;
