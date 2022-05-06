/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'playlist_songs',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      playlist_id: {
        type: 'VARCHAR(50)',
        references: 'playlists',
      },
      song_id: {
        type: 'VARCHAR(50)',
        references: 'songs',
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.addConstraint('playlist_songs', 'unique_playlist_id_and_song_id', 'UNIQUE(playlist_id, song_id)');
  pgm.createIndex('playlist_songs', ['id', 'playlist_id', 'song_id']);
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_songs', 'unique_playlist_id_and_song_id');
  pgm.dropIndex('playlist_songs', ['id', 'playlist_id', 'song_id']);
  pgm.dropTable('playlist_songs');
};
