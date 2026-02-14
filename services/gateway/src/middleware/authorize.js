/**
 * Authorization Middleware
 * Handles JWT authentication and role-based authorization
 */

const jwt = require('jsonwebtoken');
const { userClient } = require('../grpc/client');

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  console.log('AuthorizationMiddleware@verifyToken');

  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_TOKEN_KEY, (err, decoded) => {
      if (err) {
        return reject(err); // Reject with the error if verification fails
      }
      resolve(decoded); // Resolve with decoded payload if token is valid
    });
  });
};

/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
  let token = req.headers.authorization;

  if (!token) {
    return null;
  }

  // Remove 'Bearer ' prefix if present
  if (token.startsWith('Bearer ')) {
    [, token] = token.split(' ');
  }

  return token;
};

/**
 * Validate user via gRPC
 */
const validateUserGrpc = (id) => {
  console.log('AuthorizationMiddleware@validateUserGrpc');

  return new Promise((resolve, reject) => {
    userClient.ValidateUser({ id }, (err, response) => {
      if (err) return reject(new Error(err.details || err.message));

      resolve(response);
    });
  });
};

/**
 * Validate token matches stored token
 */
const validateTokenMatch = (user, token) => user?.auth_token === token;

/**
 * Authenticate user from token
 */
const authenticateUser = async (token) => {
  // Verify token
  const decoded = await verifyToken(token);

  // Find user by decoded user_id
  const user = await validateUserGrpc(decoded.user_id);

  return user;
};

/**
 * Authentication middleware
 */
const auth = async (req, res, next) => {
  console.log('AuthorizationMiddleware@auth');

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/todo-service',
    '/user-service/uploads',
    '/user-service/v1/users/login',
    '/user-service/v1/users/create',
    '/user-service/v1/users/resend-otp',
    '/user-service/v1/users/verify',
    '/user-service/v1/users/forgot-password',
    '/user-service/v1/users/forgot-password/verify-otp',
    '/user-service/v1/users/reset-password',
  ];

  if (publicRoutes.some((route) => req.originalUrl.includes(route))) {
    return next();
  }

  try {
    // Extract token from header
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    // Authenticate user
    const user = await authenticateUser(token);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Validate token matches stored token
    if (!validateTokenMatch(user, token)) {
      return res.status(401).json({ message: 'Token mismatch' });
    }

    // Attach the user to the request header
    // Explicitly set the header so the proxy forwards it automatically
    req.headers['x-user-data'] = JSON.stringify(user);

    // Proceed to next middleware
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    const errorMessage = typeof error === 'string'
      ? error
      : error?.message ?? 'Unauthorized';

    return res.status(401).json({ message: errorMessage });
  }
};

module.exports = {
  auth,
  verifyToken,
  validateUserGrpc,
};
