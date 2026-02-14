/**
 * Routes Bootstrap
 * Automatically discovers and registers all API routes
 */

const fs = require('fs').promises;
const path = require('path');

/* eslint-disable security/detect-non-literal-require, import/no-dynamic-require, global-require */
/**
 * Recursively walk directory to find all route files
 */
const walkDirectory = async (dir) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files = await fs.readdir(dir);

  const results = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const stat = await fs.stat(filePath);

      return stat.isDirectory() ? walkDirectory(filePath) : filePath;
    }),
  );

  return results.flat();
};

/**
 * Extract route name from file path
 */
const getRouteName = (filePath) => path.basename(filePath, '.js');

/**
 * Register a single route
 */
const registerRoute = (app, routeName, routeFilePath) => {
  try {
    const routeHandler = require(routeFilePath);
    app.use(`/v1/${routeName}`, routeHandler);
  } catch (error) {
    console.error(`Failed to register route from ${routeFilePath}:`, error.message);
  }
};

/**
 * Register all API routes from routes directory
 */
const registerApiRoutes = async (app, routesPath) => {
  const allFiles = await walkDirectory(routesPath);

  allFiles.forEach((file) => {
    const routeName = getRouteName(file);
    registerRoute(app, routeName, file);
  });
};

/**
 * Register 404 handler (must be last)
 */
const register404Handler = (app) => {
  app.use((req, res) => {
    res.status(404).json({
      statusCode: 404,
      message: 'Route not found',
      error: `'${req.originalUrl}' is not a valid endpoint. Please check the request URL and try again.`,
    });
  });
};

/**
 * Main route setup function
 */
const setupRoutes = async (app) => {
  const routesPath = path.join(__dirname, '../routes');
  await registerApiRoutes(app, routesPath);
  register404Handler(app); // Must be last
};

module.exports = setupRoutes;
