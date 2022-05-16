const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const mapDBToModel = require('../../utils');

const InvariantError = require('../../exceptions/InvariantError', 'fail');
const NotFoundError = require('../../exceptions/NotFoundError', 'fail');

const ServerError = require('../../exceptions/ServerError', 'error');

class AlbumsService {
  #pool;

  constructor() {
    this.#pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows[0].id) {
      await this.#pool.query('ROLLBACK');
      throw new InvariantError('Failed to add albumm', 'fail');
    }
    await this.#pool.query('COMMIT');

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT row_to_json(albums) AS album
      FROM(SELECT albums.id, albums.name, albums.year, albums.cover_url,
      (SELECT json_agg(songs) AS songs FROM(SELECT id, title, performer FROM songs WHERE songs.album_id = $1)
      songs) FROM albums) albums WHERE id=$1`,
      values: [id],
    };
    const result = await this.#pool.query(query).catch((err) => {
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      throw new NotFoundError('Album not found', 'fail');
    }

    return result.rows.map(mapDBToModel.albumTableToObject)[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Album failed to update, id not found', 'fail');
    }
    await this.#pool.query('COMMIT');
  }

  async addCoverByAlbumById(id, { coverUrl }) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Album failed to update, id not found', 'fail');
    }
    await this.#pool.query('COMMIT');
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Album failed to delete, id not found', 'fail');
    }
    await this.#pool.query('COMMIT');
  }
}

module.exports = AlbumsService;
