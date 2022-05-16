// disable camelcase to mapping songs table to song model
/* eslint-disable camelcase */

const mapDBToModel = {
  albumTableToObject: ({
    album,
  }) => ({
    id: album.id,
    name: album.name,
    year: album.year,
    coverUrl: album.cover_url,
    songs: album.songs,
  }),
  songTableToObject: ({
    id, title, year, genre, performer, duration, album_id,
  }) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
  }),
};

module.exports = mapDBToModel;
