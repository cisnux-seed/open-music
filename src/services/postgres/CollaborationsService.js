const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ServerError = require('../../exceptions/ServerError');

class CollaborationsService {
  #pool;

  constructor() {
    this.#pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      if (err.message.includes('violates foreign key')) {
        throw new NotFoundError('Playlist not found', 'fail');
      }
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new InvariantError('Collaboration failed to add', 'fail');
    }
    await this.#pool.query('COMMIT');

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
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
      throw new InvariantError('Collaboration failed to delete', 'fail');
    }
    await this.#pool.query('COMMIT');
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Collaboration has invalid verification', 'fail');
    }
  }
}

module.exports = CollaborationsService;
