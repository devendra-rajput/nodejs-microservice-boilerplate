/** Custom Require * */
const dataHelper = require('../helpers/v1/data.helpers');

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await dataHelper.hashPassword('Admin@123');
    const users = [{
      first_name: 'Super',
      last_name: 'Admin',
      email: 'admin@yopmail.com',
      password: hashedPassword,
      phone_code: '+1',
      phone_number: '1234567890',
      role: 'admin',
      status: '1',
      is_email_verified: true,
    }];

    const whereCondition = {
      email: users.map((item) => item.email),
    };

    await queryInterface.bulkDelete('users', whereCondition, {});

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
