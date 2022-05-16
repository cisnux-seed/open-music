class AlbumLikesHandler {
  #service;

  constructor(service) {
    this.#service = service;

    this.postLikeToAlbumByIdHandler = this.postLikeToAlbumByIdHandler.bind(this);
    this.getAlbumLikesByIdHandler = this.getAlbumLikesByIdHandler.bind(this);
  }

  async postLikeToAlbumByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const isAlbumLiked = await this.#service.isAlbumLiked({ userId, albumId });

    if (isAlbumLiked) {
      await this.#service.deleteLikeFromAlbum({ userId, albumId });
    } else {
      await this.#service.addLikeToAlbum({ userId, albumId });
    }

    const response = h.response({
      status: 'success',
      message: isAlbumLiked ? 'Unlike Album' : 'Like Album',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;

    const likes = await this.#service.getAlbumLikesById(id);

    if (likes.source !== undefined) {
      const response = h.response({
        status: 'success',
        data: {
          likes: likes.data,
        },
      });

      response.header('X-Data-Source', likes.source);
      return response;
    }

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = AlbumLikesHandler;
