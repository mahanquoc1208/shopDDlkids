const seedPermissions = require('./permission');
const seedRoles = require('./role');
const seedRoleToPermissions = require('./role_to_permission');
const seedUsers = require('./user');
const seedCourses = require('./course');
const seedEnrollment = require('./enrollment');
const seedCategoryCourses = require('./category_course');
const seedCustomers = require('./customer'); // Add customer seeder
const seedCart = require('./cart'); // Add customer seeder
const seedPay = require('./pay'); // Add customer seeder
const seedOrder = require('./order'); // Add customer seeder
const seedComentProduct = require('./comentProduct'); // Add comentProduct seeder
// const seedchatbox = require('./chatbot'); // Add comentProduct seeder


const seedDatabase = async () => {
  try {
    await seedCategoryCourses();
    await seedPermissions();
    await seedRoles();
    await seedUsers();
    await seedCustomers(); // Seed the customers
    await seedRoleToPermissions();
    await seedCourses();
    await seedEnrollment();
    await seedCart();
    await seedPay();
    await seedOrder();
    await seedComentProduct();
    // await seedchatbox();


  } catch (error) {
    console.log(`Failed to seed database: ${error}`);
  }
};

module.exports = seedDatabase;
