/* eslint-disable camelcase */

exports.shorthands = undefined;

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
  pgm.createIndex('collaborations', ['id', 'playlist_id', 'user_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
  pgm.dropIndex('collaborations', ['id', 'playlist_id', 'user_id']);
};
