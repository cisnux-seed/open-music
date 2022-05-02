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
        unique: true,
        notNull: true,
        references: 'playlists',
      },
      song_id: {
        type: 'VARCHAR(50)',
        unique: true,
        notNull: true,
        references: 'songs',
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.createIndex('playlist_songs', ['id', 'playlist_id', 'song_id']);
};

exports.down = (pgm) => {
  pgm.dropIndex('playlist_songs', ['id', 'playlist_id', 'song_id']);
  pgm.dropTable('playlist_songs');
};
