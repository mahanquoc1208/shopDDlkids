const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const ComentProduct = sequelize.define(
  'ComentProduct',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT, // Nội dung đánh giá
      allowNull: false,
    },
    orderDetailId: {
      type: DataTypes.BIGINT, // ID của đơn hàng
      allowNull: false,
    },
    number_star: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false // Đặt thành false nếu giá không thể là null
    }
  },
  {
    tableName: 'ComentProduct'
  }
);

module.exports = ComentProduct;
