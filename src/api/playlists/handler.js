class PlaylistHandler {
  // private service
  #service;

  // private validator
  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postSongToPlaylistByIdHandler = this.postSongToPlaylistByIdHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deleteSongFromPlaylistByIdHandler = this.deleteSongFromPlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this.#validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this.#service.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      message: 'Playlist successfully added',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this.#validator.validatePostSongToPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#service.verifyPlaylistOwner({ id: playlistId, owner: credentialId });
    const playlistSongId = await this.#service.addSongToPlaylist({ playlistId, songId });
    const response = h.response({
      status: 'success',
      message: 'Song successfully added to playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.#service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#service.verifyPlaylistOwner({ id: playlistId, owner: credentialId });
    const playlist = await this.#service.getPlaylistById({ id: playlistId, owner: credentialId });
    return {
      status: 'success',
      data: {
        ...playlist,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.#service.verifyPlaylistOwner({ id, owner: credentialId });
    await this.#service.deletePlaylistById({ id, owner: credentialId });
    return {
      status: 'success',
      message: 'Song successfully deleted',
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    this.#validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#service.verifyPlaylistOwner({ id: playlistId, owner: credentialId });
    await this.#service.deleteSongFromPlaylistById({ playlistId, songId });
    return {
      status: 'success',
      message: 'Song successfully deleted from playlist',
    };
  }
}

module.exports = PlaylistHandler;
