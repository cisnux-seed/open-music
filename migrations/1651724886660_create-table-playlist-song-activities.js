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
  pgm.addConstraint('playlist_song_activities', 'unique_playlist_id_song_id_and_user_id', 'UNIQUE(playlist_id, song_id, user_id)');
  pgm.createIndex('playlist_song_activities', ['id', 'playlist_id', 'song_id', 'user_id', 'action', 'time']);
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_song_activities', 'unique_playlist_id_song_id_and_user_id');
  pgm.dropIndex('playlist_song_activities', ['id', 'playlist_id', 'song_id', 'user_id', 'action', 'time']);
  pgm.dropTable('playlist_song_activities');
};
