/* eslint-disable camelcase */

const { PgLiteral } = require('node-pg-migrate');

exports.up = (pgm) => {
  // add extension to generate uuidv4
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  pgm.createTable(
    'songs',
    {
      id: {
        type: 'UUID',
        primaryKey: true,
        default: new PgLiteral('uuid_generate_v4()'),
      },
      title: {
        type: 'TEXT',
        notNull: true,
      },
      year: {
        type: 'INTEGER',
        notNull: true,
      },
      genre: {
        type: 'TEXT',
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
        type: 'UUID',
        notNull: false,
        references: 'albums',
      },
    },
    {
      ifNotExists: true,
    },
  );
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
