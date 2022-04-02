/* eslint-disable camelcase */

const { PgLiteral } = require('node-pg-migrate');

exports.up = (pgm) => {
  pgm.createTable(
    'songs',
    {
      id: {
        type: 'UUID',
        primaryKey: true,
        notNull: true,
        default: new PgLiteral('uuid_generate_v4()'),
      },
      title: {
        type: 'TEXT',
        notNull: true,
      },
      genre: {
        type: 'TEXT[]',
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
      albumId: {
        type: 'UUID',
        notNull: false,
        references: 'album',
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
