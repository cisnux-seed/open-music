class UploadsHandler {
  #service;

  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this.#validator.validateImageHeaders(cover.hapi.headers);

    const fileLocation = await this.#service.writeFile(id, cover, cover.hapi);

    const response = h.response({
      status: 'success',
      message: 'successfully uploaded image',
      data: {
        fileLocation,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
