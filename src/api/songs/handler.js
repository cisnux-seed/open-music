const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  // private service
  #service;

  // private validator
  #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this.#validator.validateSongPayload(request.payload);
      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      const songId = await this.#service.addSong({
        title, year, genre, performer, duration, albumId,
      });
      const response = h.response({
        status: 'success',
        message: 'Song successfully added',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server returned an error.',
      });
      response.code(500);
      return response;
    }
  }

  async getSongsHandler(request, h) {
    try {
      this.#validator.validateSongQuery(request.query);
      const { title, performer } = request.query;
      if (title !== undefined || performer !== undefined) {
        const songs = await this.#service.getSongsByKeywords({ title, performer });
        return {
          status: 'success',
          data: {
            songs,
          },
        };
      }
      const songs = await this.#service.getSongs();
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server returned an error.',
      });
      response.code(500);
      return response;
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this.#service.getSongById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server returned an error.',
      });
      response.code(500);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this.#validator.validateSongPayload(request.payload);
      const { id } = request.params;
      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      await this.#service.editSongById(id, {
        title, year, genre, performer, duration, albumId,
      });

      return {
        status: 'success',
        message: 'Song successfully updated',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server returned an error.',
      });
      response.code(500);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this.#service.deleteSongById(id);
      return {
        status: 'success',
        message: 'Song successfully deleted',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Sorry, our server returned an error.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = SongsHandler;
