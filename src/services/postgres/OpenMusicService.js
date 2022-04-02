const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class OpenMusicService {
  #pool;

  constructor() {
    this.#pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2) RETURNING id',
      values: [name, year],
    };

    const result = await this.#pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add albumm');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found');
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $5 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album failed to update, id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album failed to delete, id not found');
    }
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [title, year, genre, performer, duration, albumId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this.#pool.query('SELECT * FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song not found');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumId = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to update, id not found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to delete, id not found');
    }
  }
}
