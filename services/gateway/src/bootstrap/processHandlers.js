const { gracefulShutdown } = require('./serverHandlers');

const createSignalHandler = (server, signal) => () => {
  gracefulShutdown(server, signal);
};

const createUncaughtExceptionHandler = () => (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  console.error('Stack Trace:', error.stack);
  process.exit(1);
};

const createUnhandledRejectionHandler = (server) => (error) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Error Name:', error.name);
  console.error('Error Message:', error.message);
  console.error('Stack Trace:', error.stack);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const setupProcessHandlers = (server) => {
  console.log('✅ Setting up process handlers...');

  // Graceful shutdown signals
  process.on('SIGTERM', createSignalHandler(server, 'SIGTERM'));
  process.on('SIGINT', createSignalHandler(server, 'SIGINT'));

  // Error handlers
  process.on('uncaughtException', createUncaughtExceptionHandler());
  process.on('unhandledRejection', createUnhandledRejectionHandler(server));

  console.log('✅ Process handlers initialized\n');

  // Disable logs if configured
  if (process.env.LOG_DISABLE === 'true') {
    console.log = function noop() { };
  }
};

module.exports = {
  setupProcessHandlers,
};
