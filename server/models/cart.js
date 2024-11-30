const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const Cart = sequelize.define(
  'Cart',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    custumerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER, // Thay đổi kiểu dữ liệu thành INTEGER
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER, // Thay đổi kiểu dữ liệu thành INTEGER
      allowNull: false,
      defaultValue: 1, // Đặt giá trị mặc định là 1
    }
  },
  {
    tableName: 'Cart'
  }
);

module.exports = Cart;
