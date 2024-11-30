const { fakerEN: faker } = require('@faker-js/faker');
const ComentProduct = require('../models/comentProduct'); // Đảm bảo đường dẫn chính xác
// const Order = require('../models/order'); // Đảm bảo bạn đã có mô hình Order

// Hàm tạo dữ liệu mẫu cho bảng ComentProduct
const generateComentProducts = async () => {
  const comentProducts = [];
  const orderIds = Array.from({ length: 10 }, (_, i) => i + 1); // Giả sử có 10 đơn hàng từ 1 đến 10

  for (const orderId of orderIds) {
    comentProducts.push({
      content: faker.lorem.sentences(2), // Nội dung đánh giá giả lập
      orderDetailId, // ID của đơn hàng
      number_star: 0,
      status:1,
      rating: faker.number.int({ min: 1, max: 5 }), // Giá trị đánh giá từ 1 đến 5
      createdAt: faker.date.past(), // Ngày tạo trong quá khứ
      updatedAt: faker.date.recent(), // Ngày cập nhật gần đây
    });
  }

  return comentProducts;
};

// Hàm hạt giống dữ liệu cho bảng ComentProduct
const seedComentProducts = async () => {
  try {
    const count = await ComentProduct.count(); // Kiểm tra số lượng bản ghi hiện tại
    if (count === 0) {
      const comentProducts = await generateComentProducts(); // Tạo dữ liệu mẫu
      await ComentProduct.bulkCreate(comentProducts, { validate: true }); // Thêm dữ liệu vào bảng
      console.log('Dữ liệu mẫu cho bảng ComentProduct đã được tạo thành công!');
    } else {
      console.log('Bảng ComentProduct không trống.');
    }
  } catch (error) {
    console.log(`Lỗi khi tạo dữ liệu mẫu cho bảng ComentProduct: ${error}`);
  }
};

module.exports = seedComentProducts;
