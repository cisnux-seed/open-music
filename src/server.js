require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const albums = require('./api/albums');
const OpenMusicService = require('./services/postgres/OpenMusicService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');
const ServerError = require('./exceptions/ServerError');

const init = async () => {
  const openMusicService = new OpenMusicService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([{
    plugin: albums,
    options: {
      service: openMusicService,
      validator: AlbumsValidator,
    },
  },
  {
    plugin: songs,
    options: {
      service: openMusicService,
      validator: SongsValidator,
    },
  },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError || response instanceof ServerError) {
      const newResponse = h.response({
        status: response.status,
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return response.continue || response;
  });
  await server.start();
  console.info(`Server already running on ${server.info.uri}`);
};

init();
