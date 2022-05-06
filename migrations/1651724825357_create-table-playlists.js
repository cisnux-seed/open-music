/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'playlists',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      name: {
        type: 'TEXT',
        notNull: true,
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'users',
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.createIndex('playlists', ['id', 'owner']);
};

exports.down = (pgm) => {
  pgm.dropIndex('playlists', ['id', 'owner']);
  pgm.dropTable('playlists');
};
