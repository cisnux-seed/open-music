/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'collaborations',
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
      user_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'users',
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
  pgm.createIndex('collaborations', ['id', 'playlist_id', 'user_id']);
};

exports.down = (pgm) => {
  pgm.dropConstraint('collaborations', 'unique_playlist_id_and_user_id');
  pgm.dropIndex('collaborations', ['id', 'playlist_id', 'user_id']);
  pgm.dropTable('collaborations');
};
