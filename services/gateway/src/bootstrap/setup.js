/**
 * Application Setup
 * Configures and bootstraps the Express application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const setupRoutes = require('./routes');
const { corsConfig, validateCorsConfig } = require('../config/cors');

const rateLimiterMiddleware = require('../middleware/rateLimiter');
const timezoneMiddleware = require('../middleware/timezone');

const { logger } = require('../utils/logger');

/**
 * Setup CORS configuration
 */
const setupCORS = (app) => {
  console.log('🌐 Setting up CORS...');
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server or curl
        if (!origin) return callback(null, true);

        if (corsConfig.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        logger.error('Blocked by CORS', { origin });
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: corsConfig.credentials,
      methods: corsConfig.methods,
      allowedHeaders: corsConfig.allowedHeaders,
      exposedHeaders: corsConfig.exposedHeaders,
      maxAge: corsConfig.maxAge,
    }),
  );

  /**
   * Validate CORS configuration
   */
  validateCorsConfig();
};

/**
 * Setup security headers
 */
const setupSecurity = (app) => {
  console.log('🔒 Setting up security headers...');
  app.use(helmet());
  app.set('trust proxy', 'loopback');
};

/**
 * Setup application middleware
 */
const setupMiddleware = (app) => {
  console.log('⚙️  Setting up middleware...');
  app.use(timezoneMiddleware);
  app.use(rateLimiterMiddleware);
};

/**
 * Setup request logging
 */
const setupRequestLogging = (app) => {
  if (process.env.LOG_DISABLE === 'false') {
    console.log('📝 Setting up request logging...');
    app.use((req, res, next) => {
      console.log('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        timezone: req.timezone,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }
};

/**
 * Setup static file serving
 */
const setupStaticFiles = (app) => {
  console.log('📁 Setting up static file serving...');
  const publicPath = path.join(__dirname, '../', 'public');
  app.use('/public', express.static(publicPath));
  console.log(`   Static files path: ${publicPath}`);
};

/**
 * Setup view engine
 */
const setupViewEngine = (app) => {
  console.log('🎨 Setting up view engine...');
  app.set('view engine', 'ejs');
  app.use(expressLayouts);
  app.set('layout', 'layout');
  app.set('views', path.join(__dirname, '../', 'views'));
};

/**
 * Setup application routes
 */
const setupApplicationRoutes = async (app) => {
  console.log('🛣️  Setting up routes...');
  await setupRoutes(app);
  console.log('✅ Routes configured');
};

/**
 * Main application setup function
 */
const setupApplication = async (app) => {
  console.log('🚀 Starting application bootstrap...\n');

  try {
    // Step 1: Setup CORS
    setupCORS(app);

    // Step 2: Setup security
    setupSecurity(app);

    // Step 3: Setup middleware
    setupMiddleware(app);

    // Step 4: Setup request logging
    setupRequestLogging(app);

    // Step 5: Setup static files
    setupStaticFiles(app);

    // Step 6: Setup view engine
    setupViewEngine(app);

    // Step 7: Setup routes
    await setupApplicationRoutes(app);

    console.log('\n✅ Gateway service bootstrap completed successfully!\n');
  } catch (error) {
    console.log('\n❌ Gateway service bootstrap failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
  }
};

module.exports = {
  setupApplication,
};
