/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createIndex('albums', ['id']);
  pgm.createIndex('songs', ['id']);
};

exports.down = (pgm) => {
  pgm.dropIndex('albums', ['id']);
  pgm.dropIndex('songs', ['id']);
};
