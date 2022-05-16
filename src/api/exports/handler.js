class ExportsHandler {
  #producerService;

  #playlistsService;

  #validator;

  constructor(producerService, playlistsService, validator) {
    this.#producerService = producerService;
    this.#playlistsService = playlistsService;
    this.#validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this.#validator.validateExportPlaylistsPayload(request.payload);
    const { id: playlistId } = await request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const message = {
      targetEmail: request.payload.targetEmail,
      playlistId,
    };

    await this.#producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Your request has been sent',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
