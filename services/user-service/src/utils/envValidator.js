/**
 * Environment Validator
 * Validates required environment variables on startup
 */

const validateEnvironment = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'BASE_URL',
    'USER_SERVICE_DB_DRIVER',
    'USER_SERVICE_DB_HOST',
    'USER_SERVICE_DB_PORT',
    'USER_SERVICE_DB_NAME',
    'USER_SERVICE_DB_USER_NAME',
    'USER_SERVICE_DB_PASSWORD',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
    'MAIL_FROM',
    'SUPPORT_MAIL',
    'JWT_TOKEN_KEY',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    process.exit(1);
  }

  const validEnvironments = ['development', 'production', 'staging', 'test'];
  if (!validEnvironments.includes(process.env.NODE_ENV)) {
    console.error('❌ Invalid NODE_ENV:', process.env.NODE_ENV);
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

module.exports = { validateEnvironment };
