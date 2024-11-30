const { fakerEN: faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const User = require('../models/user');
const Role = require('../models/role');

// Fixed list of role IDs in the order of 1, 2, 3, 5
const roleIds = [1, 2, 3, 5];

// List of addresses and phone numbers
const addresses = [
  '1 Công xã Paris, Bến Nghé, Quận 1, TP.HCM',
  '6 Nguyễn An Ninh, Bến Thành, Quận 1, TP.HCM',
  '2 Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1, TP.HCM',
  '55C Nguyễn Thị Minh Khai, Bến Nghé, Quận 1, TP.HCM',
  '73 Mai Thị Lựu, Đa Kao, Quận 1, TP.HCM',
  '2 Hải Triều, Bến Nghé, Quận 1, TP.HCM',
  '135 Nguyễn Du, Bến Thành, Quận 1, TP.HCM',
  '89 Nguyễn Trãi, Bến Thành, Quận 1, TP.HCM',
];

const phoneNumbers = [
  '0123654782', '0236665894', '0123654789', 
  '0236987546', '0231654789', '0236265987', 
  '0321456987', '0321456987'
];

const generateRandomUser = async (roleIndex) => ({
  fullName: faker.person.firstName(),
  email: faker.internet.email(),
  gender: faker.datatype.boolean(),
  age: faker.number.int({ min: 18, max: 60 }), // Age between 18 and 60
  password: await bcrypt.hash(faker.internet.password(), 10), // Hashing the random password
  username: faker.internet.userName(),
  roleId: roleIds[roleIndex], // Role ID assigned based on the index
  status: 1, // Default status set to 1
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  address: addresses[roleIndex % addresses.length], // Assign address based on roleIndex
  phone: phoneNumbers[roleIndex % phoneNumbers.length], // Assign phone number based on roleIndex
});

// Function to hash the password for hard-coded users
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10); // Hash the password with a salt rounds of 10
};

const seedUsers = async () => {
  try {
    const count = await User.count();
    if (count === 0) {
      // Hard-coded user data with role IDs assigned sequentially (1, 2, 3, 5)
      const hardCodedUsers = await Promise.all([
        { fullName: 'a', email: 'a@gmail.com', password: await hashPassword('111'), username: 'a', roleId: 1, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[0], phone: phoneNumbers[0] },
        { fullName: 'b', email: 'b@gmail.com', password: await hashPassword('111'), username: 'b', roleId: 2, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[1], phone: phoneNumbers[1] },
        { fullName: 'c', email: 'c@gmail.com', password: await hashPassword('111'), username: 'c', roleId: 3, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[2], phone: phoneNumbers[2] },
        { fullName: 'd', email: 'd@gmail.com', password: await hashPassword('111'), username: 'd', roleId: 5, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[3], phone: phoneNumbers[3] },
        { fullName: 'e', email: 'e@gmail.com', password: await hashPassword('111'), username: 'e', roleId: 1, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[4], phone: phoneNumbers[4] },
        { fullName: 'f', email: 'f@gmail.com', password: await hashPassword('111'), username: 'f', roleId: 2, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[5], phone: phoneNumbers[5] },
        { fullName: 'g', email: 'g@gmail.com', password: await hashPassword('111'), username: 'g', roleId: 3, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[6], phone: phoneNumbers[6] },
        { fullName: 'h', email: 'h@gmail.com', password: await hashPassword('111'), username: 'h', roleId: 5, status: 1, createdAt: faker.date.past(), updatedAt: faker.date.recent(), address: addresses[7], phone: phoneNumbers[7] },
      ]);

      // Generate random users to fill up to 10 users total
      const randomUsers = await Promise.all(Array.from({ length: 10 - hardCodedUsers.length }, (_, index) => generateRandomUser(index % 4)));

      // Combine hard-coded users and random users
      const users = [...hardCodedUsers, ...randomUsers];
      await User.bulkCreate(users, { validate: true });
    } else {
      console.log('Users table is not empty.');
    }
  } catch (error) {
    console.log(`Failed to seed Users data: ${error}`);
  }
};

module.exports = seedUsers;
