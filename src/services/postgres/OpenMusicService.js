const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError', 'fail');
const NotFoundError = require('../../exceptions/NotFoundError', 'fail');

const ServerError = require('../../exceptions/ServerError', 'error');
const mapDBToModel = require('../../utils');

class OpenMusicService {
  // private pool property
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
    const result = await this.#pool.query(query)
      .then(async () => {
        await this.#pool.query('COMMIT');
      })
      .catch(async (err) => {
        await this.#pool.query('ROLLBACK');
        console.log(err.stack);
        console.log(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add albumm', 'fail');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    /*
     *Expected result:
     * album: {
     * id: album-nanoid,
     * name: 'album name',
     * year: year,
     * songs: [
     *   {
     *     id: 'song-nanoid',
     *     title: 'title song',
     *     performer: 'performer'
     *   }
     * ]
     * }
    */
    const query = {
      text: 'SELECT row_to_json(albums) AS album FROM(SELECT albums.id, albums.name, albums.year, (SELECT json_agg(songs) AS songs FROM(SELECT id, title, performer FROM songs WHERE songs.album_id = $1) songs) FROM albums) albums WHERE id=$1',
      values: [id],
    };
    const result = await this.#pool.query(query).catch((err) => {
      console.log(err.stack);
      console.log(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      throw new NotFoundError('Album not found', 'fail');
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query)
      .then(async () => {
        await this.#pool.query('COMMIT');
      })
      .catch(async (err) => {
        await this.#pool.query('ROLLBACK');
        console.log(err.stack);
        console.log(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });

    if (!result.rows.length) {
      throw new NotFoundError('Album failed to update, id not found', 'fail');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query)
      .then(async () => {
        await this.#pool.query('COMMIT');
      })
      .catch(async (err) => {
        await this.#pool.query('ROLLBACK');
        console.log(err.stack);
        console.log(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });

    if (!result.rows.length) {
      throw new NotFoundError('Album failed to delete, id not found', 'fail');
    }
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `songs-${nanoid(16)}`;
    const query = albumId === undefined ? {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, title, genre, year, performer, duration],
    } : {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, genre, year, performer, duration, albumId],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query)
      .then(async () => {
        await this.#pool.query('COMMIT');
      })
      .catch(async (err) => {
        await this.#pool.query('ROLLBACK');
        console.log(err.stack);
        console.log(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song', 'fail');
    }

    return result.rows[0].id;
  }

  async getSongsByKeywords({ title, performer }) {
    let query = '';

    if (title !== undefined && performer !== undefined) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2',
        values: [`%${title.toLowerCase()}%`, `%${performer.toLowerCase()}%`],
      };
    } else if (title !== undefined) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1',
        values: [`%${title.toLowerCase()}%`],
      };
    } else if (performer !== undefined) {
      query = {
        text: 'SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE $1',
        values: [`%${performer.toLowerCase()}%`],
      };
    }

    const result = await this.#pool.query(query).catch((err) => {
      console.log(err.stack);
      console.log(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });
    if (!result.rows.length) {
      throw new NotFoundError('Songs not found', 'fail');
    }

    return result.rows;
  }

  async getSongs() {
    const result = await this.#pool.query('SELECT id, title, performer FROM songs').catch((err) => {
      console.log(err.stack);
      console.log(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this.#pool.query(query).catch((err) => {
      console.log(err.stack);
      console.log(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      throw new NotFoundError('Song not found', 'fail');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = albumId === undefined ? {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5 WHERE id = $6 RETURNING id',
      values: [title, year, genre, performer, duration, id],
    } : {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query)
      .then(async () => {
        await this.#pool.query('COMMIT');
      })
      .catch(async (err) => {
        await this.#pool.query('ROLLBACK');
        console.log(err.stack);
        console.log(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to update, id not found', 'fail');
    }
  }

  async deleteSongById(id) {
    await this.#pool.query('BEGIN');
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.#pool.query(query)
      .then(async () => {
        await this.#pool.query('COMMIT');
      })
      .catch(async (err) => {
        await this.#pool.query('ROLLBACK');
        console.log(err.stack);
        console.log(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to delete, id not found', 'fail');
    }
  }
}

module.exports = OpenMusicService;
