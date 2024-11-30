const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const Chatbox = sequelize.define(
  'Chatbox',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    custumerID: {
      type: DataTypes.BIGINT,
      allowNull: true, // Nullable
    },
    userID: {
      type: DataTypes.BIGINT,
      allowNull: true, // Nullable
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'Chatbox',
  }
);

module.exports = Chatbox;
