/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'albums',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      name: {
        type: 'TEXT',
        notNull: true,
      },
      year: {
        type: 'INTEGER',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.createIndex('albums', ['id', 'name', 'year']);
};

exports.down = (pgm) => {
  pgm.dropIndex('albums', ['id', 'name', 'year']);
  pgm.dropTable('albums');
};
