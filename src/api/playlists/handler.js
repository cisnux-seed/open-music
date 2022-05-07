class PlaylistHandler {
  // private service
  #service;

  // private validator
  #validator;

  #actions;

  constructor(service, validator, actions) {
    this.#service = service;
    this.#validator = validator;
    this.#actions = actions;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postSongToPlaylistByIdHandler = this.postSongToPlaylistByIdHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdHandler = this.getPlaylistByIdHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deleteSongFromPlaylistByIdHandler = this.deleteSongFromPlaylistByIdHandler.bind(this);
    this.getPlaylistActivitiesByIdHandler = this.getPlaylistActivitiesByIdHandler.bind(this);
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

    await this.#service.verifyPlaylistAccess(playlistId, credentialId);
    const playlistSongId = await this.#service.addSongToPlaylist({ playlistId, songId });
    const action = this.#actions.add;
    await this.#service.addPlaylistActivity({
      playlistId, songId, userId: credentialId, action,
    });

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

  async getPlaylistActivitiesByIdHandler(request) {
    const { id: playlistId } = await request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this.#service.getPlaylistActivitiesById(playlistId);
    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }

  async getPlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this.#service.getPlaylistById(playlistId);
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
    await this.#service.verifyPlaylistOwner(id, credentialId);
    // check if the playlist has songs?
    const isPlaylistHasSongs = await this.#service.isPlaylistHasSongs(id);
    const isPlaylistHasActivities = await this.#service.isPlaylistHasActivities(id);
    // delete all songs in the playlist, if the playlist has songs
    if (isPlaylistHasSongs) {
      await this.#service.deleteSongFromPlaylistById({ playlistId: id });
    }

    if (isPlaylistHasActivities) {
      await this.#service.deletePlaylistActivityById(id);
    }
    await this.#service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist successfully deleted',
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    this.#validator.validateDeleteSongFromPlaylistPayload(request.payload);

    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.#service.verifyPlaylistAccess(playlistId, credentialId);
    await this.#service.deleteSongFromPlaylistById({ playlistId, songId });
    const action = this.#actions.delete;
    await this.#service.addPlaylistActivity({
      playlistId, songId, userId: credentialId, action,
    });

    return {
      status: 'success',
      message: 'Song successfully deleted from playlist',
    };
  }
}

module.exports = PlaylistHandler;
