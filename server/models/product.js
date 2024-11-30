const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const Product = sequelize.define(
  'Product', // Tên model
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    categoryCourseId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assignedBy: {
      type: DataTypes.BIGINT,
      allowNull: true // Thêm allowNull nếu cần
    },
    Discount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true // Thêm allowNull nếu cần
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true // Thêm allowNull nếu cần
    },
    locationPath: {
      type: DataTypes.STRING,
      allowNull: true // Thêm allowNull nếu cần
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false // Đặt thành false nếu giá không thể là null
    },
    publicStatus: {
      type: DataTypes.INTEGER,
      allowNull: true // Thêm allowNull nếu cần
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true // Thêm allowNull nếu cần
    },
    publicDate: {
      type: DataTypes.DATE,
      allowNull: true // Thêm allowNull nếu cần
    },    
    Inventory_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false // Đặt thành false nếu số lượng tồn kho không thể là null
    }
  },
  {
    tableName: 'product', // Tên bảng trong CSDL
    timestamps: true
  }
);

module.exports = Product; // Xuất model
