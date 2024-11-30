const { DataTypes } = require('sequelize');
const sequelize = require('./init'); // Giả sử bạn đã có một phiên bản sequelize được thiết lập

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true, // Cho phép rỗng
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, // Cho phép rỗng
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  gender: {
    type: DataTypes.BOOLEAN,
    allowNull: true, // Cho phép rỗng
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true, // Cho phép rỗng
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Cho phép rỗng
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true, // Cho phép rỗng
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true, // Cho phép rỗng
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true, // Cho phép rỗng
  },
  status: {
    type: DataTypes.INTEGER, // Thêm cột status
    allowNull: true, // Cho phép rỗng
    defaultValue: 1, // Giá trị mặc định là 1
  },
  Reward_points: {
    type: DataTypes.DECIMAL(10, 2), // Thêm cột Reward_points
    allowNull: true, // Cho phép rỗng
    defaultValue: 0.00, // Giá trị mặc định là 0.00
  },
  roleId: {
    type: DataTypes.BIGINT,
    allowNull: true, // Cho phép rỗng
    defaultValue: 6
  },
}, {
  tableName: 'customers',
  timestamps: true,
});

module.exports = Customer;
