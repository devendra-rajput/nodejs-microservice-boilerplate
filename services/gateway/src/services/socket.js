/**
 * Socket.IO Service
 * Handles real-time bidirectional communication
 */

const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisClient } = require('../config/redis');
const { verifyToken, validateUserGrpc } = require('../middleware/authorize');
const { CHANNELS, EVENTS } = require('../constants/socket_events');

// We need a separate 'sub' client for the adapter because it enters subscriber mode
const subClient = redisClient.duplicate();
let io = null;

/**
 * Create Socket.IO configuration
 */
const createSocketConfig = () => ({
  path: '/socket.io', // Standard path
  cors: {
    origin: '*', // Adjust for security in production
    methods: ['GET', 'POST'],
  },
});

/**
 * Extract token from socket handshake
 */
const extractToken = (socket) => {
  let token = socket.handshake.headers.authorization;

  // Check for token in auth object
  if (!token && socket?.handshake?.auth?.token) {
    token = socket.handshake.auth.token;
  }

  // Remove 'Bearer ' prefix if present
  if (token && token.startsWith('Bearer ')) {
    [, token] = token.split(' ');
  }

  return token || null;
};

/**
 * Authenticate user from token
 */
const authenticateUser = async (token) => {
  /** Verify the token */
  const decoded = await verifyToken(token);

  // Find user via gRPC
  const user = await validateUserGrpc(decoded.user_id);
  if (!user) {
    throw new Error('Authentication error: User not found');
  }

  // Check if the token matches the stored auth_token for the user
  if (!user?.auth_token || user.auth_token !== token) {
    throw new Error('Authentication error: Token mismatch');
  }

  return user;
};

/**
 * Authentication middleware for Socket.IO
 */
const authMiddleware = () => async (socket, next) => {
  try {
    // Extract token from handshake
    const token = extractToken(socket);
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Authenticate user
    const user = await authenticateUser(token);

    // Attach user to socket for future use
    // eslint-disable-next-line no-param-reassign
    socket.user = user;

    next();
  } catch (err) {
    console.log('SocketService@authMiddleware Error:', err.message);
    return next(new Error('Authentication error: Invalid Token'));
  }
};

/**
 * Handle user disconnection
 */
const handleDisconnection = (socket) => {
  const userId = socket.user?.id;
  console.log(`User disconnected: ${userId} (Socket ID: ${socket.id})`);
};

/**
 * Handle test event
 */
const handleTestEvent = (data, callback) => {
  console.log('Test event received:', data);
  callback({ message: 'Test event received', data });
};

/**
 * Register all event handlers for a socket
 */
const registerEventHandlers = (socket) => {
  // Test event handler
  socket.on(EVENTS.ON.TEST_EVENT, (data, callback) => {
    handleTestEvent(data, callback);
  });

  // Add more event handlers here as needed
};

/**
 * Handle new socket connection
 */
const handleConnection = async (socket) => {
  const userId = socket.user?.id;
  console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

  // Join user-specific room
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  }

  // Register event handlers
  registerEventHandlers(socket);

  // Handle disconnection
  socket.on('disconnect', () => handleDisconnection(socket));
};

/**
 * Get Socket.IO instance
 */
const getIO = () => io;

/**
 * Cleanup Socket.IO server
 */
const cleanup = async () => {
  console.log('SocketService@cleanup');
  try {
    if (io) {
      // Close all socket connections
      await new Promise((resolve) => {
        io.close((err) => {
          if (err && err.code !== 'ERR_SERVER_NOT_RUNNING') {
            console.error('SocketService@cleanup Error closing connections:', err);
          }
          resolve();
        });
      });

      io = null;
      console.log('✅ Socket.IO connections closed');
      return true;
    }
    return true;
  } catch (error) {
    console.error('SocketService@cleanup Error:', error);
    return false;
  }
};

/**
 * Initialize Socket.IO server
 */
const initSocket = (httpServer) => {
  try {
    // Create Socket.IO server with configuration
    const socketConfig = createSocketConfig();
    io = new Server(httpServer, socketConfig);
    console.log(`Socket.IO initialized on path: ${socketConfig.path}`);

    // Apply authentication middleware
    io.use(authMiddleware());

    // Handle connections
    io.on('connection', handleConnection);

    return io;
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
    throw error;
  }
};

/**
 * Configure Redis Adapter
 */
const configRedisAdapter = () => {
  // Check if clients are already connected before calling connect()
  const pubConnect = redisClient.status === 'ready' ? Promise.resolve() : redisClient.connect();
  const subConnect = subClient.status === 'ready' ? Promise.resolve() : subClient.connect();

  Promise.all([pubConnect, subConnect])
    .then(() => {
      io.adapter(createAdapter(redisClient, subClient));
      console.log('Socket.IO Redis Adapter configured');

      // --- CUSTOM EVENT LISTENER ---
      // Subscribe to our custom channel for generic service events
      subClient.subscribe(CHANNELS.SYSTEM_EVENTS, (err, count) => {
        if (err) {
          console.error(`Failed to subscribe to ${CHANNELS.SYSTEM_EVENTS}:`, err);
          // Critical failure: If we can't subscribe, the socket service is invalid.
          io.close(() => {
            console.log('Socket server closed due to Redis subscription failure.');
          });
        } else {
          console.log(`Subscribed to ${CHANNELS.SYSTEM_EVENTS} channel. Count: ${count}`);
        }
      });

      // Listen for messages on that channel
      subClient.on('message', (channel, message) => {
        if (channel === CHANNELS.SYSTEM_EVENTS) {
          try {
            const { userId, type, data } = JSON.parse(message);
            console.log(`Received system event for user ${userId}: ${type}`);

            // Emit to the user's room (Local only, to prevent Redis Adapter loops)
            io.to(`user_${userId}`).local.emit(type, data);
          } catch (e) {
            console.error('Error parsing system event:', e);
          }
        }
      });
    }).catch((err) => {
      // Ignore "already open" errors if reusing existing connections (double safety)
      if (err.message !== 'Redis is already connecting/connected') {
        console.error('Redis Adapter connection error:', err);

        // Critical failure
        io.close(() => {
          console.log('Socket server closed due to Redis Adapter connection failure.');
        });
      } else {
        console.error('Failed to configure Redis Adapter:', err);
        throw err;
      }
    });
};

// Export all functions
module.exports = {
  initSocket,
  configRedisAdapter,
  getIO,
  cleanup,
};
