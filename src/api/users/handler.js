class UsersHandler {
  #validator;

  #service;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getUsersByUsernameHandler = this.getUsersByUsernameHandler.bind(this);
  }

  async getUsersByUsernameHandler(request) {
    const { username = '' } = request.query;
    const users = await this.#service.getUsersByUsername(username);
    return {
      status: 'success',
      data: {
        users,
      },
    };
  }

  async postUserHandler(request, h) {
    this.#validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this.#service.addUser({ username, password, fullname });

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    const { id } = await request.params;
    const user = await this.#service.getUserById(id);

    const response = h.response({
      status: 'success',
      data: {
        user,
      },
    });
    return response;
  }
}

module.exports = UsersHandler;
