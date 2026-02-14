module.exports = {
  development: {
    username: process.env.USER_SERVICE_DB_USER_NAME,
    password: process.env.USER_SERVICE_DB_PASSWORD,
    database: process.env.USER_SERVICE_DB_NAME,
    host: process.env.USER_SERVICE_DB_HOST,
    dialect: process.env.USER_SERVICE_DB_DRIVER,
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  },
  staging: {
    username: process.env.USER_SERVICE_DB_USER_NAME,
    password: process.env.USER_SERVICE_DB_PASSWORD,
    database: process.env.USER_SERVICE_DB_NAME,
    host: process.env.USER_SERVICE_DB_HOST,
    dialect: process.env.USER_SERVICE_DB_DRIVER,
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  },
  production: {
    username: process.env.USER_SERVICE_DB_USER_NAME,
    password: process.env.USER_SERVICE_DB_PASSWORD,
    database: process.env.USER_SERVICE_DB_NAME,
    host: process.env.USER_SERVICE_DB_HOST,
    dialect: process.env.USER_SERVICE_DB_DRIVER,
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  },
};
