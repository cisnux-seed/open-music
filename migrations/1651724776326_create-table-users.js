/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'users',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      username: {
        type: 'VARCHAR(50)',
        unique: true,
        notNull: true,
      },
      password: {
        type: 'TEXT',
        notNull: true,
      },
      fullname: {
        type: 'TEXT',
        notNull: true,
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.createIndex('users', ['id', 'username', 'fullname']);
};

exports.down = (pgm) => {
  pgm.dropIndex('users', ['id', 'username', 'fullname']);
  pgm.dropTable('users');
};
