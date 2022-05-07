/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'playlist_song_activities',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      playlist_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'playlists',
      },
      song_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'songs',
      },
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'users',
      },
      action: {
        type: 'TEXT',
        notNull: true,
      },
      time: {
        type: 'TEXT',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.createIndex('playlist_song_activities', ['id', 'playlist_id', 'song_id', 'user_id', 'action', 'time']);
};

exports.down = (pgm) => {
  pgm.dropIndex('playlist_song_activities', ['id', 'playlist_id', 'song_id', 'user_id', 'action', 'time']);
  pgm.dropTable('playlist_song_activities');
};
