const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const OrderDetail = sequelize.define(
  'OrderDetail',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    ProductID: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    orderID: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),  // 10 digits total, 2 digits after the decimal point
      allowNull: false
    }
  },
  {
    tableName: 'OrderDetail'
  }
);

module.exports = OrderDetail;
