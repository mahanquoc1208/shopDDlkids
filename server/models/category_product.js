const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const CategoryCourse = sequelize.define(
  'CategoryProduct',
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
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true, // Cho phép null nếu cần
      defaultValue: 1  // Gán giá trị mặc định là 1
    }    
  },
  {
    tableName: 'category_product'
  }
)

module.exports = CategoryCourse
