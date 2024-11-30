const sequelize = require('./init')
const User = require('./user')
const Product = require('./product')
const Enrollment = require('./enrollments')
const Permission = require('./permission')
const Role = require('./role')
const RoleToPermission = require('./role_to_permission')
const CategoryCourse = require('./category_product')
const Customer = require('./customer')
const Cart = require('./cart')
const Pay = require('./pay')
const Order = require('./order')
const OrderDetail = require('./orderDetail')
const ComentProduct = require('./comentProduct')
const Chatbot = require('./chatbox')
const Revire = require('./Review')


User.belongsToMany(Product, { through: Enrollment, foreignKey: 'userId' })
Product.belongsToMany(User, { through: Enrollment, foreignKey: 'courseId' })

Cart.hasMany(Customer, { foreignKey: 'custumerId' })
Customer.belongsTo(Cart, { foreignKey: 'custumerId' })
// Thiết lập mối quan hệ
// Một sản phẩm có thể có trong nhiều giỏ hàng
Product.hasMany(Cart, { foreignKey: 'productId', as: 'Carts' });

// Một giỏ hàng chứa một sản phẩm
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });

Role.hasMany(Customer, { foreignKey: 'roleId' })
Customer.belongsTo(Role, { foreignKey: 'roleId' })

Role.hasMany(User, { foreignKey: 'roleId' })
User.belongsTo(Role, { foreignKey: 'roleId' })


RoleToPermission.belongsTo(Role, { foreignKey: 'roleId' })
RoleToPermission.belongsTo(Permission, { foreignKey: 'permissionId' })

Role.belongsToMany(Permission, { through: RoleToPermission, foreignKey: 'roleId' })
Permission.belongsToMany(Role, { through: RoleToPermission, foreignKey: 'permissionId' })

Product.belongsTo(CategoryCourse, { foreignKey: 'categoryCourseId' })
CategoryCourse.hasMany(Product, { foreignKey: 'categoryCourseId' })



// pay với order

Order.belongsTo(Pay, { foreignKey: 'payID', targetKey: 'id' });
Pay.hasMany(Order, { foreignKey: 'payID', sourceKey: 'id' });
// order với custumer

Order.belongsTo(Customer, { foreignKey: 'customerId', targetKey: 'id' });
Customer.hasMany(Order, { foreignKey: 'customerId', sourceKey: 'id' });

// chi tiết với bản đơn hàng và chi tiết
OrderDetail.belongsTo(Order, { foreignKey: 'orderID' })
Order.hasMany(OrderDetail, { foreignKey: 'orderID' })

// chi tiết với bản đơn hàng và sản phẩm
OrderDetail.belongsTo(Product, { foreignKey: 'ProductID' })
Product.hasMany(OrderDetail, { foreignKey: 'ProductID' })

//  bảng đánh giá với chi tiết đơn hàng
ComentProduct.belongsTo(OrderDetail, { foreignKey: 'orderDetailId' })
OrderDetail.hasMany(ComentProduct, { foreignKey: 'orderDetailId' })

//  bảng chatbot với user
Chatbot.belongsTo(User, { foreignKey: 'userID' })
User.hasMany(Chatbot, { foreignKey: 'userID' })

//  bảng chatbot với custumer
Chatbot.belongsTo(Customer, { foreignKey: 'custumerID' })
Customer.hasMany(Chatbot, { foreignKey: 'custumerID' })

//  bảng đánh giá với bảng khách hàng
Revire.belongsTo(Customer, { foreignKey: 'customerID', targetKey: 'id' });
Customer.hasMany(Revire, { foreignKey: 'customerID', sourceKey: 'id' });


module.exports = {
  sequelize,
  models: {
    User,
    CategoryCourse,
    Product,
    Permission,
    Role,
    RoleToPermission,
    Customer,
    Cart,
    Pay,
    Order,
    OrderDetail,
    ComentProduct,
    Chatbot,
    Revire,
  }
}
