const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getPlaylistByIdHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getPlaylistActivitiesByIdHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postSongToPlaylistByIdHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deleteSongFromPlaylistByIdHandler,
    options: {
      auth: 'open_music_app_jwt',
    },
  },
];

module.exports = routes;
