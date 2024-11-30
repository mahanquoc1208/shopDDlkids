const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    customerID: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    number_star: {
      type: DataTypes.FLOAT, // Sử dụng FLOAT để lưu số thập phân
      allowNull: false,
    },
  },
  {
    tableName: 'Review', // Tên bảng trong cơ sở dữ liệu
  }
);

module.exports = Review;
