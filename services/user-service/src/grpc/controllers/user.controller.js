const grpc = require('@grpc/grpc-js');

const i18n = require('../../config/i18n');
const UserModel = require('../../resources/v1/users/user.model');

/**
 * Validate User by ID
 */
const validateUser = async (call, callback) => {
  try {
    const { id } = call.request;

    // Find user by ID
    const user = await UserModel.getOneByColumnNameAndValue('id', id, true);
    if (!user) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: i18n.__('error.userNotFound'),
      });
    }

    // Return user details
    callback(null, {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
      auth_token: user.auth_token,
      password: user.password,
    });
  } catch (error) {
    console.error('gRPC ValidateUser Error:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message,
    });
  }
};

module.exports = {
  validateUser,
};
