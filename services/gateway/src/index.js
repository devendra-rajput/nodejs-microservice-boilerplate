const { createServer } = require('./bootstrap/serverHandlers');
const { setupProcessHandlers } = require('./bootstrap/processHandlers');

/**
 * Main application function
 * Initializes and starts the server
 */
const main = async () => {
  try {
    // Create and start server
    const server = await createServer();

    // Setup process handlers for graceful shutdown
    setupProcessHandlers(server);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

// Start the application
main();
