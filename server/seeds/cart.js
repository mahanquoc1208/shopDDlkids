const { fakerEN: faker } = require('@faker-js/faker');
const Cart = require('../models/cart'); // Đảm bảo rằng đường dẫn đến mô hình là chính xác

// Hàm tạo dữ liệu mẫu cho bảng Cart
const generateCarts = async () => {
  const carts = [];
  const customerIds = Array.from({ length: 25 }, (_, i) => i + 1); // Tạo 25 customerId từ 1 đến 25

  for (const customerId of customerIds) {
    const productIds = faker.helpers.arrayElements(
      Array.from({ length: 10 }, (_, i) => i + 1), // Giả sử có 10 sản phẩm từ 1 đến 10
      5 // Chọn ngẫu nhiên 5 productId
    );
    
    for (const productId of productIds) {
      carts.push({
        productId,
        custumerId: customerId, // Gán customerId tương ứng
        quantity: faker.number.int({ min: 1, max: 10 }), // Số lượng ngẫu nhiên từ 1 đến 10
        status: 0, // Đặt giá trị status là 0
        createdAt: faker.date.past(), // Ngày tạo trong quá khứ
        updatedAt: faker.date.recent(), // Ngày cập nhật gần nhất
      });
    }
  }
  
  return carts;
};

// Hàm hạt giống dữ liệu cho bảng Cart
const seedCarts = async () => {
  try {
    const count = await Cart.count(); // Kiểm tra số lượng bản ghi hiện tại trong bảng Cart
    if (count === 0) {
      const carts = await generateCarts(); // Tạo dữ liệu mẫu
      await Cart.bulkCreate(carts, { validate: true }); // Thêm dữ liệu vào bảng Cart
      // console.log('Dữ liệu mẫu cho bảng Cart đã được tạo thành công!');
    } else {
      console.log('Bảng Cart không trống.');
    }
  } catch (error) {
    // console.log(`Lỗi khi tạo dữ liệu mẫu cho bảng Cart: ${error}`);
  }
};

module.exports = seedCarts;
