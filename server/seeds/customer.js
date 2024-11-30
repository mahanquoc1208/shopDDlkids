const { fakerEN: faker } = require('@faker-js/faker');
const Customer = require('../models/customer'); // Assuming you've created the model
const Role = require('../models/role');

// Fixed list of role IDs for customer roles
const roleIds = [6, 7, 8]; // Khách hàng thường, khách hàng kim cương, khách hàng VIP

// List of addresses and phone numbers to use for seeding
const addresses = [
  '1 Công xã Paris, Bến Nghé, Quận 1, TP.HCM',
  '12 Nguyễn An Ninh, Bến Thành, Quận 1, TP.HCM',
  '36 Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1, TP.HCM',
  '25 Nguyễn Thị Minh Khai, Bến Nghé, Quận 1, TP.HCM',
  '72 Mai Thị Lựu, Đa Kao, Quận 1, TP.HCM',
  '2 Hải Triều, Bến Nghé, Quận 1, TP.HCM',
  '35 Nguyễn Du, Bến Thành, Quận 1, TP.HCM',
  '20 Nguyễn Trãi, Bến Thành, Quận 1, TP.HCM',
];

const phoneNumbers = [
  '0123654782', '0236665894', '0123654789', 
  '0236987546', '0231654789', '0236265987', 
  '0321456987', '0321456987'
];

// Function to generate random role ID from the list
const generateRoleId = () => {
  const randomIndex = Math.floor(Math.random() * roleIds.length); // Randomly select a role ID
  return roleIds[randomIndex]; // Return the selected role ID
};

// Function to generate customers
const generateCustomers = async () => {
  return await Promise.all(Array.from({ length: 10 }, async (_, index) => ({
    fullName: faker.person.firstName(),
    email: faker.internet.email(),
    gender: faker.datatype.boolean(),
    age: faker.number.int({ min: 18, max: 60 }), // Random age between 18 and 60
    password: faker.internet.password(),
    username: faker.internet.userName(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    address: addresses[index % addresses.length], // Assign address from the list in order
    roleId: generateRoleId(), // Randomly assign one of the roles (6, 7, or 8)
    phone: phoneNumbers[index % phoneNumbers.length], // Assign phone number from the list in order
    status: 1, // Default status set to 1
    Reward_points: 0.00, // Default reward points
  })));
};

// Seed the customers data
const seedCustomers = async () => {
  try {
    const count = await Customer.count();
    if (count === 0) {
      const customers = await generateCustomers();
      await Customer.bulkCreate(customers, { validate: true });
      console.log('Customer data seeded successfully!');
    } else {
      console.log('Customers table is not empty.');
    }
  } catch (error) {
    console.log(`Failed to seed Customers data: ${error}`);
  }
};

module.exports = seedCustomers;
