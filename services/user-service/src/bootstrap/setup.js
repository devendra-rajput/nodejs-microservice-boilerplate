/**
 * Application Setup
 * Configures and bootstraps the Express application
 */

const express = require('express');

const setupRoutes = require('./routes');
const i18n = require('../config/i18n');
const { connectDB } = require('../config/v1/mysql');
const { connectRedis } = require('../config/v1/redis');
const { startGrpcServer } = require('../grpc/server');

const { initialize: initializeModels } = require('./modelManager');
const errorMiddleware = require('../middleware/error');

const { validateEnvironment: validateEnv } = require('../utils/envValidator');

/**
 * Validate environment variables
 */
const setupEnvironmentValidation = () => {
  console.log('📋 Validating environment variables...');
  validateEnv();
  console.log('✅ Environment validation passed');
};

/**
 * Connect to databases and initialize models
 */
const setupDatabases = async () => {
  console.log('🔌 Connecting to MySQL...');
  await connectDB();
  console.log('✅ MySQL connected');

  console.log('🔧 Initializing database models...');
  await initializeModels();
  console.log('✅ Models initialized');

  console.log('🔌 Connecting to Redis...');
  await connectRedis();
  console.log('✅ Redis connected\n');
};

/**
 * Setup body parsers
 */
const setupBodyParsers = (app) => {
  console.log('📦 Setting up body parsers...');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json({ limit: '50mb' }));
};

/**
 * Setup security headers
 */
const setupSecurity = (app) => {
  console.log('🔒 Setting up security headers...');
  app.set('trust proxy', 'loopback');
};

/**
 * Setup internationalization
 */
const setupI18n = (app) => {
  console.log('🌍 Setting up i18n...');
  app.use(i18n.init);
};

/**
 * Setup static file serving
 */
const setupStaticFiles = (app) => {
  console.log('📁 Setting up static file serving...');
  app.use('/public', express.static('public'));
  app.use('/uploads', express.static('uploads'));
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
 * Setup error handling middleware
 */
const setupErrorHandling = (app) => {
  console.log('❌ Setting up error handling...');
  app.use(errorMiddleware);
};

/**
 * Main application setup function
 */
const setupApplication = async (app) => {
  console.log('🚀 Starting application bootstrap...\n');

  try {
    // Step 1: Validate environment
    setupEnvironmentValidation();

    // Step 2: Connect to databases
    await setupDatabases();

    // Step 3: Start gRPC Server
    startGrpcServer();

    // Step 4: Setup body parsers
    setupBodyParsers(app);

    // Step 5: Setup security
    setupSecurity(app);

    // Step 6: Setup i18n
    setupI18n(app);

    // Step 7: Setup static files
    setupStaticFiles(app);

    // Step 8: Setup routes
    await setupApplicationRoutes(app);

    // Step 9: Setup error handling (must be last)
    setupErrorHandling(app);

    console.log('\n✅ Application bootstrap completed successfully!\n');
  } catch (error) {
    console.log('\n❌ Application bootstrap failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    process.exit(1);
  }
};

module.exports = {
  setupApplication,
};
