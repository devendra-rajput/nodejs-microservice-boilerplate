const { createProxyMiddleware } = require('http-proxy-middleware');

/** Middleware * */
const authMiddleware = require('../middleware/authorize');

/**
 * Register root route
 */
const registerRootRoute = (app) => {
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Everything is working fine.',
      host: req.get('host'),
      version: process.env.API_VER || 'v1',
      environment: process.env.NODE_ENV || 'development',
    });
  });
};

/**
 * Register health check route
 */
const registerHealthRoute = (app) => {
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
};

/**
 * Register load test route
 */
const registerLoadTestRoute = (app) => {
  app.get('/load-test', (req, res) => {
    res.status(200).send('OK');
  });
};

/**
 * Register static page routes (terms, privacy)
 */
const registerStaticPageRoutes = (app) => {
  // Terms of Service page
  app.get('/terms', (req, res) => {
    res.render('terms', {
      title: 'Terms of Service | Node JS Boilerplate',
      headerTitle: 'Terms of Service',
      description: 'Terms and conditions for using our service.',
      companyName: 'Node JS Boilerplate',
    });
  });

  // Privacy Policy page
  app.get('/privacy', (req, res) => {
    res.render('privacy', {
      title: 'Privacy Policy | Node JS Boilerplate',
      headerTitle: 'Privacy Policy',
      description: 'Privacy policy for our service.',
      companyName: 'Node JS Boilerplate',
    });
  });
};

/**
 * Register user service routes
 */
const registerUserServiceRoutes = (app) => {
  // --- User Routes Proxy ---
  // Forward all requests starting with /user-service to the user-service URL
  // Assuming user-service is running on the docker network at http://user-service:50051
  app.use(`/${process.env.USER_SERVICE_NAME}`, [authMiddleware.auth], createProxyMiddleware({
    target: `http://${process.env.USER_SERVICE_URL}`,
    changeOrigin: true,
    pathRewrite: {
      [`^/${process.env.USER_SERVICE_NAME}`]: '', // RESULT: /user-service/api/v1/users/profile -> /api/v1/users/profile
    },
  }));

  // --- Todo Routes Proxy ---
  // Forward all requests starting with /todo-service to the todo-service URL
  // Assuming todo-service is running on the docker network at http://todo-service:50052
  app.use(`/${process.env.TODO_SERVICE_NAME}`, [authMiddleware.auth], createProxyMiddleware({
    target: `http://${process.env.TODO_SERVICE_URL}`,
    changeOrigin: true,
    pathRewrite: {
      [`^/${process.env.TODO_SERVICE_NAME}`]: '', // RESULT: /todo-service/api/v1/todos -> /api/v1/todos
    },
  }));
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
  // Register routes in order
  registerRootRoute(app);
  registerHealthRoute(app);
  registerLoadTestRoute(app);
  registerStaticPageRoutes(app);
  registerUserServiceRoutes(app);
  register404Handler(app); // Must be last
};

module.exports = setupRoutes;
