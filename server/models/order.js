const { DataTypes } = require('sequelize');
const sequelize = require('./init');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    payID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'Pay', // tên bảng được tham chiếu
        key: 'id' // khóa trong bảng được tham chiếu
      }
    },
    status: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    custumerID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    Tota_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
    },
    
    order_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'Order',
    hooks: {
      // Before creating a new order, generate the next "name" value
      beforeCreate: async (order) => {
        // Find the last order by id
        const lastOrder = await Order.findOne({
          order: [['id', 'DESC']],
          attributes: ['name'],
        });

        // Generate the next order name
        let newName = 'DH01'; // Default name if no orders exist

        if (lastOrder && lastOrder.name) {
          const lastNumber = parseInt(lastOrder.name.slice(2), 10); // Extract number part from "DHxx"
          const newNumber = lastNumber + 1;
          newName = `DH${newNumber.toString().padStart(2, '0')}`; // Format to "DHxx"
        }

        // Assign the generated name to the new order
        order.name = newName;
      }
    }
  }
);

module.exports = Order;
