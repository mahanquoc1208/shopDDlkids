const { fakerEN: faker } = require('@faker-js/faker');
const Pay = require('../models/pay');

const payMethods = [
  {
    name: 'Tiền Mặt',
    description: 'Thanh toán khi nhận hàng',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  {
    name: 'MoMo',
    description: 'Thanh toán qua ví điện tử MoMo',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }
];

const seedPayMethods = async () => {
  try {
    const count = await Pay.count();
    if (count === 0) {
      await Pay.bulkCreate(payMethods, { validate: true });
    } else {
      console.log('Pay table is not empty.');
    }
  } catch (error) {
    console.log(`Failed to seed Pay data: ${error}`);
  }
};

module.exports = seedPayMethods;
