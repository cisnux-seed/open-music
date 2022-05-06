/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'songs',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      title: {
        type: 'TEXT',
        notNull: true,
      },
      genre: {
        type: 'TEXT',
        notNull: true,
      },
      year: {
        type: 'INTEGER',
        notNull: true,
      },
      performer: {
        type: 'TEXT',
        notNull: true,
      },
      duration: {
        type: 'INTEGER',
        notNull: false,
      },
      album_id: {
        type: 'VARCHAR(50)',
        notNull: false,
        references: 'albums',
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.createIndex('songs', ['id', 'title', 'genre', 'year', 'performer']);
};

exports.down = (pgm) => {
  pgm.dropIndex('songs', ['id', 'title', 'genre', 'year', 'performer']);
  pgm.dropTable('songs');
};
