const Order = require('../models/order'); // Assuming you've created the Order model

let orderCounter = 1; // Start the counter at 1

const generateOrders = async () => {
  const statuses = ['Thành công', 'Thất bại', 'Bạn đã hủy đơn hàng', 'Đánh giá thành công']; // Possible order statuses

  return Array.from({ length: 200 }, () => {
    const orderName = `DH${String(orderCounter).padStart(3, '0')}`; // Format as DH001, DH002, etc.
    orderCounter++; // Increment the counter

    return {
      payID: 1, // Hard-code payment ID
      status: 1, // Set status to 1 for all orders
      name: orderName, // Auto-incrementing name like DH001, DH002, etc.
      custumerID: (orderCounter % 10) + 1, // Sequential customer IDs from 1 to 10
      Tota_amount: 500 + orderCounter * 50, // Incremental total amount starting at 500
      order_status: statuses[Math.floor(Math.random() * statuses.length)], // Randomize order status
      createdAt: new Date(), // Use current date for seeding
      updatedAt: new Date(), // Use current date for seeding
    };
  });
};

const seedOrders = async () => {
  try {
    const count = await Order.count();
    if (count === 0) {
      const orders = await generateOrders();
      await Order.bulkCreate(orders, { validate: true });
      console.log('Orders created successfully!');
    } else {
      console.log('Orders table is not empty.');
    }
  } catch (error) {
    console.log(`Failed to seed Orders data: ${error}`);
  }
};

module.exports = seedOrders;
