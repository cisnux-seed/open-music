/* eslint-disable camelcase */

const { PgLiteral } = require('node-pg-migrate');

exports.up = (pgm) => {
  pgm.createTable(
    'album',
    {
      id: {
        type: 'uuid',
        default: new PgLiteral('uuid_generate_v4()'),
        notNull: true,
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
};

exports.down = (pgm) => {
  pgm.dropTable('album');
};
