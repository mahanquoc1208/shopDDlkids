const express = require('express')
const { models } = require('../models')
const router = express.Router()
require('sequelize')

// viết api hiển thị danh mục khóa học và hiển thị tên của sản phẩm theo từng danh mục
router.get('/home', async (req, res) => {
    try {
      // Lấy danh sách các category_product cùng với tên của các sản phẩm trong đó
      const category_product = await models.CategoryCourse.findAll({
        attributes: ['id', 'name'], // Chỉ lấy id và tên của CategoryProduct
        include: [{
          model: models.Course, // Kết nối với model Product
          attributes: ['name'], // Lấy thuộc tính name của Product
        }],
        order: [['id', 'DESC']] // Sắp xếp theo id giảm dần
      });
  
      // Cấu trúc dữ liệu để phù hợp với yêu cầu
      const result = category_product.map(categoryProduct => ({
        id: categoryProduct.id,
        name: categoryProduct.name,
        products: categoryProduct.Products.map(product => product.name) // Lấy tên các sản phẩm
      }));
  
      // Trả về kết quả
      res.json({
        data: result
      });
    } catch (error) {
      console.error('Error fetching categories with product names:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

module.exports = router
