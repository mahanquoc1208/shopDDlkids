const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const Pay = sequelize.define(
  'Pay',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'Pay'
  }
);

module.exports = Pay;
