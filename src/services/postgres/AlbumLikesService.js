const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError', 'fail');
const NotFoundError = require('../../exceptions/NotFoundError', 'fail');

const ServerError = require('../../exceptions/ServerError', 'error');

class AlbumLikesService {
  #pool;

  #cacheService;

  constructor(cacheService) {
    this.#pool = new Pool();
    this.#cacheService = cacheService;
  }

  async addLikeToAlbum({
    userId, albumId,
  }) {
    const id = `album-likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      if (err.message.includes('violates foreign key')) {
        throw new NotFoundError('Album not found', 'fail');
      }
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows[0].id) {
      await this.#pool.query('ROLLBACK');
      throw new InvariantError('Playlist not found', 'fail');
    }
    await this.#pool.query('COMMIT');

    return result.rows[0].id;
  }

  async isAlbumLiked({ userId, albumId }) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this.#pool.query(query);
    await this.#cacheService.delete(`album_likes:${albumId}`);

    return result.rows.length;
  }

  async deleteLikeFromAlbum({
    userId, albumId,
  }) {
    await this.#pool.query('BEGIN');
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };
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
    await this.#cacheService.delete(`album_likes:${albumId}`);
  }

  async getAlbumLikesById(albumId) {
    try {
      const result = await this.#cacheService.get(`album_likes:${albumId}`);
      return {
        source: 'cache',
        data: parseInt(result, 10),
      };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this.#pool.query(query);
      const albumLikes = result.rows.length;

      await this.#cacheService.set(`album_likes:${albumId}`, albumLikes.toString());
      return albumLikes;
    }
  }
}

module.exports = AlbumLikesService;
