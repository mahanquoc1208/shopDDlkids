const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    gender: {
      type: DataTypes.STRING
    },
    age: {
      type: DataTypes.INTEGER
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING // Thêm cột phone
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Set default value to 1
      allowNull: false
    }    
  },
  {
    tableName: 'users'
  }
);

module.exports = User;
