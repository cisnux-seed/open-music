const routes = (handler) => [{
  method: 'GET',
  path: '/songs',
  handler: handler.getSongsHandler,
},
{
  method: 'POST',
  path: '/songs',
  handler: handler.postSongHandler,
},
{
  method: 'PUT',
  path: '/songs{id}',
  handler: handler.putSongByIdHandler,
},
{
  method: 'DELETE',
  path: '/songs{id}',
  handler: handler.deleteSongByIdHandler,
},
];

module.exports = routes;
