/* eslint-disable camelcase */

const { PgLiteral } = require('node-pg-migrate');

exports.up = (pgm) => {
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  pgm.createTable(
    'albums',
    {
      id: {
        type: 'UUID',
        default: new PgLiteral('uuid_generate_v4()'),
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
  pgm.dropTable('albums');
};
