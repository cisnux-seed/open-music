/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable(
    'user_album_likes',
    {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      user_id: {
        type: 'VARCHAR(50)',
        references: 'users',
      },
      album_id: {
        type: 'VARCHAR(50)',
        references: 'albums',
      },
    },
    {
      ifNotExists: true,
    },
  );
  pgm.addConstraint('user_album_likes', 'unique_user_id_and_album_id', 'UNIQUE(user_id, album_id)');
  pgm.createIndex('user_album_likes', ['id', 'user_id', 'album_id']);
};

exports.down = (pgm) => {
  pgm.dropConstraint('user_album_likes', 'unique_user_id_and_album_id');
  pgm.dropIndex('user_album_likes', ['id', 'user_id', 'album_id']);
  pgm.dropTable('user_album_likes');
};
