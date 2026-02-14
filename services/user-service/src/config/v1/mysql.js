const Sequelize = require('sequelize');

/** Establish the connection with DB */
const sequelize = new Sequelize(
  process.env.USER_SERVICE_DB_NAME,
  process.env.USER_SERVICE_DB_USER_NAME,
  process.env.USER_SERVICE_DB_PASSWORD,
  {
    dialect: process.env.USER_SERVICE_DB_DRIVER,
    host: process.env.USER_SERVICE_DB_HOST,
    port: process.env.USER_SERVICE_DB_PORT,
    logging: false,
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to mysql');
  } catch (err) {
    console.error(`MySQL Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
