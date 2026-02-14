/**
 * Authorization Middleware
 * Handles role-based authorization
 */

const response = require('../../helpers/v1/response.helpers');
const UserModel = require('../../resources/v1/users/user.model');

/**
 * Validate user exists and is active
 */
const validateUser = (user) => {
  if (!user) {
    return { key: 'error.userNotFound' };
  }

  if (user.status !== UserModel.statuses.ACTIVE) {
    return {
      key: 'auth.accountBlocked',
      params: { supportEmail: process.env.SUPPORT_MAIL },
    };
  }

  return null;
};

/**
 * Validate user role
 */
const validateRole = (user, requiredRole) => {
  if (!requiredRole) {
    return true; // No role requirement
  }

  const validRoles = [UserModel.roles.ADMIN, UserModel.roles.USER];

  if (!validRoles.includes(requiredRole)) {
    return false; // Invalid role specified
  }

  return user.role === requiredRole;
};

/**
 * Authorization middleware factory
 * Creates middleware with optional role validation
 */
const auth = (roleToValidate = null) => async (req, res, next) => {
  console.log('AuthorizationMiddleware@auth');

  try {
    const userData = req.headers['x-user-data'];

    let user = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Failed to parse x-user-data header', e);
      }
    }

    // Fallback: If req.user was somehow already set (e.g. by a local strategy), use it
    if (!user && req.user) {
      user = req.user;
    }

    // Validate user exists and is active
    const userValidation = validateUser(user);
    if (userValidation) {
      const message = userValidation.params
        ? res.__(userValidation.key, userValidation.params)
        : userValidation.key;
      return response.unauthorized(message, res, false);
    }

    // Validate role if required
    if (!validateRole(user, roleToValidate)) {
      return response.badRequest('auth.unauthorizedRole', res, false);
    }

    // Attach to req.user so controllers can use it
    req.user = user;
    // Proceed to next middleware
    next();
  } catch (error) {
    return response.unauthorized(error.message, res, false);
  }
};

module.exports = {
  auth,
};
