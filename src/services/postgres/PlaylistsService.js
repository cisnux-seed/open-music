const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const InvariantError = require('../../exceptions/InvariantError', 'fail');
const NotFoundError = require('../../exceptions/NotFoundError', 'fail');

const ServerError = require('../../exceptions/ServerError', 'error');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  // private pool property
  #pool;

  constructor() {
    this.#pool = new Pool();
  }

  async verifyPlaylistOwner({ id, owner }) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found', 'fail');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('You have no right to access this resource', 'fail');
    }
  }

  async addPlaylistActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `playlist_song_activities-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
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

    if (!result.rows[0].id) {
      await this.#pool.query('ROLLBACK');
      throw new InvariantError('Playlist not found', 'fail');
    }
    await this.#pool.query('COMMIT');

    return result.rows[0].id;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlists-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
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
      throw new InvariantError('Failed to add song', 'fail');
    }
    await this.#pool.query('COMMIT');

    return result.rows[0].id;
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlist_songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    await this.#pool.query('BEGIN');
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      if (err.message.includes('violates foreign key')) {
        throw new NotFoundError('Failed to add song, song id not found', 'fail');
      }
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows[0].id) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Failed to add song, id not found', 'fail');
    }
    await this.#pool.query('COMMIT');

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      INNER JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON playlists.owner = collaborations.user_id
      WHERE playlists.owner = $1 OR collaborations.id = $1`,
      values: [owner],
    };
    const result = await this.#pool
      .query(query)
      .catch((err) => {
        console.error(err.stack);
        console.error(err.message);
        throw new ServerError('Sorry, our server returned an error.', 'error');
      });
    return result.rows;
  }

  async getPlaylistActivitiesById(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities
      INNER JOIN users ON playlist_song_activities.user_id = users.id
      INNER JOIN songs ON playlist_song_activities.song_id = songs.id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.#pool.query(query).catch((err) => {
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found', 'fail');
    }

    return result.rows;
  }

  async getPlaylistById({ id, owner }) {
    const query = {
      text: `SELECT row_to_json(playlists) AS playlist 
      FROM(SELECT playlists.id, playlists.name, users.username, (SELECT json_agg(playlist_songs) AS songs
      FROM(SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs INNER JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1) playlist_songs)
      FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE users.id = $2) playlists WHERE id=$1`,
      values: [id, owner],
    };

    const result = await this.#pool.query(query).catch((err) => {
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found', 'fail');
    }

    return result.rows[0];
  }

  async isPlaylistHasSongs(id) {
    const query = {
      text: 'SELECT * FROM playlist_songs WHERE playlist_id = $1',
      values: [id],
    };

    const result = await this.#pool.query(query).catch((err) => {
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    return result.rows.length;
  }

  async isPlaylistHasActivities(id) {
    const query = {
      text: 'SELECT * FROM playlist_song_activities WHERE playlist_id = $1',
      values: [id],
    };

    const result = await this.#pool.query(query).catch((err) => {
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    return result.rows.length;
  }

  async deletePlaylistById(id) {
    await this.#pool.query('BEGIN');
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Playlist failed to delete, id not found', 'fail');
    }
    await this.#pool.query('COMMIT');
  }

  async deleteSongFromPlaylistById({ playlistId, songId }) {
    await this.#pool.query('BEGIN');
    const query = songId === undefined
    // delete all songs
      ? {
        text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 RETURNING id',
        values: [playlistId],
      }
    // delete only selected song
      : {
        text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
        values: [playlistId, songId],
      };
    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Songs of Playlist failed to delete, id not found', 'fail');
    }
    await this.#pool.query('COMMIT');
  }

  async deletePlaylistActivityById(playlistId) {
    await this.#pool.query('BEGIN');
    const query = {
      text: 'DELETE FROM playlist_song_activities WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this.#pool.query(query).catch(async (err) => {
      await this.#pool.query('ROLLBACK');
      console.error(err.stack);
      console.error(err.message);
      throw new ServerError('Sorry, our server returned an error.', 'error');
    });

    if (!result.rows.length) {
      await this.#pool.query('ROLLBACK');
      throw new NotFoundError('Playlist not found', 'fail');
    }
    await this.#pool.query('COMMIT');
  }
}

module.exports = PlaylistsService;
