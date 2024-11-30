const express = require('express')
const { models, sequelize } = require('../models')
const router = express.Router()
const { Op } = require('sequelize');

require('sequelize')
const { infoLogger, errorLogger } = require('../logs/logger')
function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response
  })
}
function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error
  })
}
// API để xem danh sách các category_course và thực hiện phân trang
const MESSAGES1 = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error'
}
// Trong hàm xử lý route GET
router.get('/pay/', async (req, res) => {
  try {
    // Lấy danh sách các category_course từ cơ sở dữ liệu
    const pay = await models.Pay.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      order: [['id', 'DESC']] // Sắp xếp theo id giảm dần
    })

    // Trả về kết quả
    res.json({
      data: pay
    })
  } catch (error) {
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR })
  }
})
// hiển thị đơn hàng
// hiển thị đơn hàng theo id, hiển thị thông tin chi tiết đơn hàng và sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the id from the route parameter

    // Fetch the specific order by id
    const order = await models.Order.findOne({
      where: { id }, // Find order by id
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
      include: [
        {
          model: models.OrderDetail, // Join with OrderDetail
          attributes: ['id', 'ProductID', 'quantity', 'price'], // Select relevant columns from OrderDetail
          include: [
            {
              model: models.Product, // Join with Product table
              attributes: ['name', 'locationPath'], // Select relevant columns from Product
            },
          ],
        },
      ],
    });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the order and order details data
    res.json({
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// thêm đơn hang
router.post('/', async (req, res) => {
  try {
    const { payID, status, custumerID, Tota_amount, order_status } = req.body;

    // Validate required fields
    if (!payID || !status || !custumerID || !Tota_amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Fetch the last order to determine the next name
    const lastOrder = await models.Order.findOne({
      order: [['id', 'DESC']], // Get the latest order by id
      attributes: ['name'] // Only need the name attribute
    });

    // Generate the next name based on the last order's name
    let newName = 'HD01'; // Default name if no orders exist

    if (lastOrder && lastOrder.name) {
      // Extract the numeric part of the last name and increment it
      const lastNumber = parseInt(lastOrder.name.slice(2), 10); // Extract number part
      const newNumber = lastNumber + 1;
      newName = `HD${newNumber.toString().padStart(2, '0')}`; // Format as HDxx
    }

    // Create a new order with the generated name
    const newOrder = await models.Order.create({
      name: newName, // Generated name
      payID,
      status,
      custumerID,
      Tota_amount,
      order_status: 'Chờ xử lý'
    });

    // Return the created order
    res.status(201).json({
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Trong hàm xử lý route GET
router.get('/', async (req, res) => {
  try {
    // Đếm tổng số bản ghi trong bảng Order
    const totalOrdersCount = await models.Order.count();

    // Lấy danh sách các bản ghi từ cơ sở dữ liệu
    const categoryCourses = await models.Order.findAll({
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
      order: [['id', 'DESC']] // Sắp xếp theo id giảm dần
    });

    // Trả về kết quả cùng với tổng số bản ghi
    res.json({
      total: totalOrdersCount,
      data: categoryCourses
    });
  } catch (error) {
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR });
  }
});

// them sản pphaamr vào giỏ hàng chi tiết
// Thêm OrderDetail
router.post('/order-details', async (req, res) => {
  try {
    console.log('Dữ liệu nhận từ request:', req.body); // Thêm log để kiểm tra dữ liệu nhận được

    const { ProductID, orderID, quantity, price } = req.body;

    // Kiểm tra từng trường hợp lỗi riêng lẻ
    if (!ProductID) {
      return res.status(400).json({ error: 'Thiếu ProductID' });
    }
    if (!orderID) {
      return res.status(400).json({ error: 'Thiếu orderID' });
    }
    if (!quantity) {
      return res.status(400).json({ error: 'Thiếu số lượng (quantity)' });
    }
    if (!price) {
      return res.status(400).json({ error: 'Thiếu giá (price)' });
    }

    const order = await models.Order.findByPk(orderID);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const newOrderDetail = await models.OrderDetail.create({
      ProductID,
      orderID,
      quantity,
      price: parseFloat(price),  // Đảm bảo giá là số
    });

    res.status(201).json({
      message: 'Chi tiết đơn hàng đã được tạo thành công',
      data: newOrderDetail
    });
  } catch (error) {
    console.error('Lỗi khi tạo chi tiết đơn hàng:', error); // Log lỗi chi tiết
    res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
});
// hiển thị đơn hàng theo từng khách hàng
router.get('/custumer/:custumerID', async (req, res) => {
  try {
    // Get the custumerID from the URL parameters
    const { custumerID } = req.params;

    // Fetch orders by custumerID
    const orders = await models.Order.findAll({
      where: { custumerID },
      attributes: [
        ['id', 'orderId'],  // Alias id as orderId
        'name',
        'payID',
        'status',
        'order_status',
        'custumerID',
        'Tota_amount',
        'createdAt',
        'updatedAt'
      ],
      order: [['id', 'DESC']] // Sort by id in descending order
    });

    // Check if any orders were found
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this customer' });
    }

    // Return the orders for the given custumerID
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR });
  }
});
// cập nhật trạng thái khi khách hàng hủy đơn 
router.put('/updateStatus/:id', async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số route

    // Tìm đơn hàng theo id mà không cần include các thông tin từ OrderDetail và Product
    const order = await models.Order.findOne({
      where: { id },
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
    });

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Cập nhật order_status thành 'Bạn đã hủy đơn hàng'
    await order.update({ order_status: 'Bạn đã hủy đơn hàng' });

    // Trả về dữ liệu đơn hàng đã được cập nhật
    res.json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// thêm đánh giá đơn hàng
router.post('/add_cmtproduct', async (req, res) => {
  try {
    console.log('Received review data:', req.body); // Log to check the received data

    const { orderDetailId, content, number_star } = req.body;

    // Check for missing fields
    if (!orderDetailId) {
      return res.status(400).json({ error: 'Missing orderDetailId' });
    }
    if (content === null || content.trim() === '') { // Check for null or empty string
      return res.status(400).json({ error: 'Content cannot be null or empty' });
    }
    if (number_star === undefined || typeof number_star !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid number_star' });
    }

    // Check if the order detail exists
    const orderDetail = await models.OrderDetail.findByPk(orderDetailId);
    if (!orderDetail) {
      return res.status(404).json({ error: 'Order detail not found' });
    }

    // Create a new review entry
    const newComment = await models.ComentProduct.create({
      orderDetailId,
      content,
      number_star, // Add number_star to the created comment
    });

    res.status(201).json({
      message: 'Order review added successfully',
      data: newComment,
    });
  } catch (error) {
    console.error('Error creating order review:', error); // Detailed error log
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Hiển thị thông tin của chi tiết đơn hàng cùng với bình luận
router.get('/comments/all/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Fetch OrderDetail with ComentProduct and custumerID
    const comments = await models.OrderDetail.findAll({
      where: { ProductID: productId },
      include: [
        {
          model: models.ComentProduct,
          attributes: ['id', 'content', 'orderDetailId', 'number_star', 'createdAt'],
        },
        {
          model: models.Order,
          attributes: ['custumerID'],
        },
      ],
      attributes: ['id', 'ProductID', 'orderID', 'quantity', 'price']
    });

    // Step 2: Fetch customer email based on custumerID
    const custumerIds = [...new Set(comments.map(comment => comment.Order.custumerID))];
    const customers = await models.Customer.findAll({
      where: { id: custumerIds },
      attributes: ['id', 'email']
    });

    // Step 3: Map customer email to comments
    const customerMap = customers.reduce((map, customer) => {
      map[customer.id] = customer.email;
      return map;
    }, {});

    // Step 4: Process comments to add email, count occurrences, and calculate average stars
    const commentsWithFullName = comments.map(comment => {
      const { ComentProducts } = comment;
      
      // Calculate total stars and count for averaging
      let totalStars = 0;
      let countStars = 0;
      const commentFrequency = {};
      
      ComentProducts.forEach(comentProduct => {
        const { id, number_star } = comentProduct;
        const starValue = parseFloat(number_star);

        // Count occurrences of each ComentProduct ID
        commentFrequency[id] = (commentFrequency[id] || 0) + 1;
        
        // Accumulate star ratings for average calculation
        totalStars += starValue;
        countStars += 1;
      });

      // Calculate average number of stars
      const averageStars = countStars > 0 ? (totalStars / countStars).toFixed(2) : 0;

      return {
        ...comment.toJSON(),
        Email: customerMap[comment.Order.custumerID] || null,
        commentFrequency,
        averageStars,
      };
    });

    res.json(commentsWithFullName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể lấy thông tin OrderDetail' });
  }
});
// hiển thị số cmt và trung bình sao theo từng sản phẩm
router.get('/comments/allcmt/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Fetch OrderDetail with ComentProduct and custumerID
    const comments = await models.OrderDetail.findAll({
      where: { ProductID: productId },
      include: [
        {
          model: models.ComentProduct,
          attributes: ['id', 'content', 'orderDetailId', 'number_star', 'createdAt'],
        },
        {
          model: models.Order,
          attributes: ['custumerID'],
        },
      ],
      attributes: ['id', 'ProductID', 'orderID', 'quantity', 'price']
    });

    // Initialize counters for total comments and star sum
    let totalComments = 0;
    let totalStars = 0;

    // Step 2: Calculate total comments and average stars across all ComentProducts
    comments.forEach(comment => {
      comment.ComentProducts.forEach(comentProduct => {
        const starValue = parseFloat(comentProduct.number_star);
        totalStars += starValue;
        totalComments += 1;
      });
    });

    // Calculate average number of stars for all comments
    const averageStars = totalComments > 0 ? (totalStars / totalComments).toFixed(2) : 0;

    // Step 3: Return only commentFrequency and averageStars
    res.json({
      commentFrequency: totalComments,
      averageStars: averageStars,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể lấy thông tin OrderDetail' });
  }
});

router.put('/updateStatusuccess/:id', async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số route

    // Tìm đơn hàng theo id mà không cần include các thông tin từ OrderDetail và Product
    const order = await models.Order.findOne({
      where: { id },
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
    });

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Cập nhật order_status thành 'Bạn đã hủy đơn hàng'
    await order.update({ order_status: 'Đánh giá thành công' });

    // Trả về dữ liệu đơn hàng đã được cập nhật
    res.json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// cập nhật tráng tháng đơn hàng chuẩn bị xong
router.put('/updateorderconfirma/:id', async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số route

    // Tìm đơn hàng theo id mà không cần include các thông tin từ OrderDetail và Product
    const order = await models.Order.findOne({
      where: { id },
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
    });

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Cập nhật order_status thành 'Bạn đã hủy đơn hàng'
    await order.update({ order_status: 'Đơn hàng chuẩn bị xong' });

    // Trả về dữ liệu đơn hàng đã được cập nhật
    res.json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Trong hàm xử lý route GET
router.get('/confirma/confirma', async (req, res) => {
  try {
    // Đếm tổng số bản ghi trong bảng Order với trạng thái 'Chờ xử lý'
    const totalPendingOrdersCount = await models.Order.count({
      where: { order_status: 'Chờ xử lý' }
    });

    // Lấy danh sách các bản ghi từ cơ sở dữ liệu với trạng thái 'Chờ xử lý'
    const pendingOrders = await models.Order.findAll({
      where: { order_status: 'Chờ xử lý' }, // Lọc theo trạng thái
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
      order: [['id', 'DESC']] // Sắp xếp theo id giảm dần
    });

    // Trả về kết quả cùng với tổng số bản ghi
    res.json({
      total: totalPendingOrdersCount,
      data: pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR });
  }
});
// hiển thị đơn hàng Đơn hàng chuẩn bị xong cho shipper
router.get('/confirma/shipper', async (req, res) => {
  try {
    // Đếm tổng số bản ghi trong bảng Order với trạng thái 'Chờ xử lý'
    const totalPendingOrdersCount = await models.Order.count({
      where: { order_status: 'Đơn hàng chuẩn bị xong' }
    });

    // Lấy danh sách các bản ghi từ cơ sở dữ liệu với trạng thái 'Chờ xử lý'
    const pendingOrders = await models.Order.findAll({
      where: { order_status: 'Đơn hàng chuẩn bị xong' }, // Lọc theo trạng thái
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
      order: [['id', 'DESC']] // Sắp xếp theo id giảm dần
    });

    // Trả về kết quả cùng với tổng số bản ghi
    res.json({
      total: totalPendingOrdersCount,
      data: pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR });
  }
});
// cập nhật trạng thái thành công
router.put('/succes/:id', async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số route

    // Tìm đơn hàng theo id mà không cần include các thông tin từ OrderDetail và Product
    const order = await models.Order.findOne({
      where: { id },
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
    });

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Cập nhật order_status thành 'Thành công' và payID thành 2
    await order.update({ 
      order_status: 'Thành công', 
      payID: 2 
    });

    // Trả về dữ liệu đơn hàng đã được cập nhật
    res.json({
      message: 'Order status and payment ID updated successfully',
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// cập nhật trạng thất bại
router.put('/erorr/:id', async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số route

    // Tìm đơn hàng theo id mà không cần include các thông tin từ OrderDetail và Product
    const order = await models.Order.findOne({
      where: { id },
      attributes: ['id', 'name', 'payID', 'status', 'custumerID', 'order_status', 'Tota_amount', 'createdAt', 'updatedAt'],
    });

    // Kiểm tra xem đơn hàng có tồn tại không
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Cập nhật order_status thành 'Bạn đã hủy đơn hàng'
    await order.update({ order_status: 'Thất bại' });

    // Trả về dữ liệu đơn hàng đã được cập nhật
    res.json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// API đếm số lượng đơn hàng, tổng Tota_amount và số lượng đơn hàng theo trạng thái làm thống kê
router.get('/order-stats/count', async (req, res) => {
  try {
    // Count total orders
    const totalOrdersCount = await models.Order.count();

    // Calculate the total amount of all orders
    let totalAmount = await models.Order.sum('Tota_amount');
    
    // Format totalAmount to 2 decimal places
    totalAmount = totalAmount.toFixed(2);

    // Initialize object to count by status
    const statusCounts = {
      success: 0,
      failed: 0,
      cancelled: 0,
      reviewed: 0
    };

    // Fetch orders with order_status and createdAt attributes
    const orders = await models.Order.findAll({
      attributes: ['order_status', 'createdAt']
    });

    // Iterate through each order and count by status
    orders.forEach((order) => {
      switch (order.order_status) {
        case 'Thành công':
          statusCounts.success++;
          break;
        case 'Thất bại':
          statusCounts.failed++;
          break;
        case 'Bạn đã hủy đơn hàng':
          statusCounts.cancelled++;
          break;
        case 'Đánh giá thành công':
          statusCounts.reviewed++;
          break;
      }
    });

    // Return result with totalOrders, totalAmount, statusCounts, and orders with createdAt
    res.json({
      totalOrders: totalOrdersCount,
      totalAmount,
      statusCounts,
      orders // includes createdAt information for each order
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
});
// đếm số lượng tk đc tạo của khách hàng
router.get('/dashboard/customer', async (req, res) => {
  try {
    // Fetch only the createdAt and roleID columns for customers with status = 1
    const activeCustomers = await models.Customer.findAll({
      where: { status: 1 },
      attributes: ['createdAt', 'roleID'],  // Only include createdAt and roleID columns
      order: [['createdAt', 'ASC']]  // Sort by createdAt in ascending order
    });

    res.json(activeCustomers);
  } catch (error) {
    res.status(500).json({ message: 'User not found' });
  }
});

//
router.get('/dashboard/order-details', async (req, res) => {
  try {
    // Truy vấn dữ liệu từ bảng OrderDetail và join với bảng Product
    const orderDetails = await models.OrderDetail.findAll({
      attributes: ['ProductID', 'quantity', 'createdAt'],  // Lấy ProductID và quantity
      include: [{
        model: models.Product,
        attributes: ['name'] // Fetch the product name
      }],
      attributes: ['quantity', 'createdAt'],
    });

    // Nhóm dữ liệu theo ProductID và tính tổng số lượng trong JavaScript
    const groupedData = orderDetails.reduce((acc, orderDetail) => {
      const productID = orderDetail.ProductID;
      const quantity = orderDetail.quantity;
      const createdAt = orderDetail.createdAt;
      const productName = orderDetail.Product.name;

      if (!acc[productID]) {
        acc[productID] = {
          productName,
          createdAt,
          totalQuantity: 0
        };
      }

      acc[productID].totalQuantity += quantity;

      return acc;
    }, {});

    // Chuyển đổi dữ liệu đã nhóm thành mảng để trả về
    const result = Object.values(groupedData);

    res.json(result);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});
// thống kê full 
router.get('/orders/dashboard', async (req, res) => {
  try {
    const { day, month, year } = req.query;

    let startDate, endDate;

    if (day) {
      startDate = new Date(day);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(day);
      endDate.setHours(23, 59, 59, 999);
    } else if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date('1970-01-01');
      endDate = new Date();
    }

    // Query orders with the specific statuses
    const orders = await models.Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        // order_status: {
        //   [Op.in]: ['Đánh giá thành công', 'Thành công'], // Only specific statuses for Tota_amount
        // },
      },
      attributes: ['id', 'Tota_amount', 'order_status', 'createdAt'],
    });

    const totalOrders = orders.length;

    // Calculate totalAmount only for specific order statuses
    const totalAmount = orders.reduce((sum, order) => {
      // Check if order status is 'Đánh giá thành công' or 'Thành công'
      if (['Đánh giá thành công', 'Thành công'].includes(order.order_status)) {
        return sum + parseFloat(order.Tota_amount || 0);
      }
      return sum; // If order status is not one of these, skip adding its amount
    }, 0);
    
    const formattedTotalAmount = totalAmount.toFixed(2);

    const orderData = orders.map(order => ({
      order_status: order.order_status,
      createdAt: order.createdAt,
    }));

    const customers = await models.Customer.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: ['roleId', 'createdAt'],
    });

    const customerData = customers.map(customer => ({
      roleId: customer.roleId,
      createdAt: customer.createdAt,
    }));

    const orderDetails = await models.OrderDetail.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: models.Product,
          attributes: ['name'], // Fetch the product name
        },
        {
          model: models.Order, // Join with the Order table
          where: {
            order_status: {
              [Op.in]: ['Đánh giá thành công', 'Thành công'], // Filter by specific statuses
            },
          },
          attributes: [], // Exclude additional fields from Order in the result
        },
      ],
      attributes: ['quantity', 'createdAt'],
    });
    

    const orderDetailData = orderDetails.map(detail => ({
      ProductID: detail.Product ? detail.Product.name : 'Unknown Product',
      quantity: detail.quantity,
      createdAt: detail.createdAt,
    }));
  // Query review data
      const reviews = await models.Revire.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('number_star')), 'average_star'], // Average stars
          [sequelize.fn('COUNT', sequelize.col('id')), 'review_count'], // Number of reviews
        ],
        raw: true,
      });
      const reviewData = reviews.map(review => ({
        average_star: parseFloat(review.average_star || 0).toFixed(1), // Format to one decimal
        review_count: parseInt(review.review_count || 0, 10),
      }));



    res.status(200).json({
      totalOrders,
      totalAmount: formattedTotalAmount,
      orders: orderData,
      customers: customerData,
      orderDetails: orderDetailData,
      reviews: reviewData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ dashboard' });
  }
});



// hiển thị theo số sao và cmt cho admin xem
router.get('/comments/all1/:number_star', async (req, res) => {
  try {
    const { number_star } = req.params;

    // Fetch OrderDetail and ComentProduct based on number_star
    const comments = await models.OrderDetail.findAll({
      include: [
        {
          model: models.ComentProduct,
          where: { number_star: number_star },
          attributes: ['id', 'content', 'orderDetailId', 'number_star', 'createdAt'],
          order: [['number_star', 'DESC']]
        },
        {
          model: models.Order,
          attributes: ['custumerID'],
        },
        {
          model: models.Product, // Include Product model to get the name
          attributes: ['name']  // Only fetching the name of the product
        }
      ],
      attributes: ['id', 'ProductID', 'orderID', 'quantity', 'price']
    });

    // Fetch customer email based on custumerID
    const custumerIds = [...new Set(comments.map(comment => comment.Order.custumerID))];
    const customers = await models.Customer.findAll({
      where: { id: custumerIds },
      attributes: ['id', 'email']
    });

    // Map customer emails by custumerID
    const customerMap = customers.reduce((map, customer) => {
      map[customer.id] = customer.email;
      return map;
    }, {});

    // Flatten and process comments to create a single-level structure
    const commentsWithFullData = comments.map(comment => {
      const comentProduct = comment.ComentProducts[0]; // Assume each OrderDetail has one ComentProduct
      const productName = comment.Product ? comment.Product.name : null; // Get product name

      return {
        id: comment.id,
        ProductID: productName, // Use product name instead of ProductID
        orderID: comment.orderID,
        quantity: comment.quantity,
        price: comment.price,
        comentProductID: comentProduct.id,
        content: comentProduct.content,
        number_star: comentProduct.number_star,
        createdAt: comentProduct.createdAt,
        email: customerMap[comment.Order.custumerID] || null
      };
    });

    res.json(commentsWithFullData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể lấy thông tin OrderDetail' });
  }
});
// trừ sản phẩm sau khi đóng gói thành công dựa product id để trừ
router.post('/update_inventory', async (req, res) => {
  const { productID, quantity } = req.body;

  try {
    // Tìm Product tương ứng với productID
    const product = await models.Product.findOne({ where: { id: productID } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Kiểm tra xem số lượng tồn kho có đủ để trừ không
    if (product.Inventory_quantity < quantity) {
      return res.status(400).json({ message: 'Not enough inventory' });
    }

    // Tìm OrderDetail dựa trên productID
    const orderDetail = await models.OrderDetail.findOne({
      where: { ProductID: productID },
    });

    if (!orderDetail) {
      return res.status(404).json({ message: 'Order detail not found' });
    }

    // Trừ số lượng tồn kho
    product.Inventory_quantity -= quantity;

    // Lưu lại thay đổi vào bảng Product
    await product.save();

    // Trả về thông tin sản phẩm đã được cập nhật
    return res.status(200).json({
      message: 'Inventory updated successfully',
      updatedProduct: product,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Cộngsản phẩm sau khi đóng gói thành công dựa product id để trừ sau khi giao hàng thất bại
router.post('/sum_update_inventory', async (req, res) => {
  const { productID, quantity } = req.body;

  try {
    // Tìm Product tương ứng với productID
    const product = await models.Product.findOne({ where: { id: productID } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Tìm OrderDetail dựa trên productID
    const orderDetail = await models.OrderDetail.findOne({
      where: { ProductID: productID },
    });

    if (!orderDetail) {
      return res.status(404).json({ message: 'Order detail not found' });
    }

    // Cộng số lượng tồn kho thay vì trừ
    product.Inventory_quantity += quantity;

    // Lưu lại thay đổi vào bảng Product
    await product.save();

    // Trả về thông tin sản phẩm đã được cập nhật
    return res.status(200).json({
      message: 'Inventory updated successfully',
      updatedProduct: product,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});
// thêm đánh giá trang web cho khách hàng 
router.post('/review/customer', async (req, res) => {
  try {
    const { customerID, number_star } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!customerID || !number_star) {
      return res.status(400).json({ error: 'customerID và number_star là bắt buộc.' });
    }

    // Tạo bản ghi mới trong bảng Review
    const newReview = await models.Revire.create({
      customerID,
      number_star,
    });

    // Trả về dữ liệu vừa thêm
    res.status(201).json({
      message: 'Thêm review thành công.',
      data: newReview,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi thêm review.' });
  }
});
// chuyển tiền vào cột Tota_amount của user khi đặt hàng thành công
router.post('/sum/_update_reward_points', async (req, res) => {
  const { currentUserID, Tota_amount } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!currentUserID || Tota_amount == null) {
      return res.status(400).json({ message: 'currentUserID and Tota_amount are required' });
    }

    // Ép kiểu Tota_amount thành số (float) và định dạng lại thành 2 chữ số thập phân
    let totalAmount = parseFloat(Tota_amount);

    if (isNaN(totalAmount)) {
      return res.status(400).json({ message: 'Invalid Tota_amount value' });
    }

    // Đảm bảo totalAmount có 2 chữ số thập phân
    totalAmount = totalAmount.toFixed(2);

    // Tìm Customer tương ứng với currentUserID
    const customer = await models.Customer.findOne({ where: { id: currentUserID } });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Cộng Tota_amount vào Reward_points (đảm bảo Reward_points là số)
    customer.Reward_points = parseFloat(customer.Reward_points) + parseFloat(totalAmount);

    // Kiểm tra và cập nhật roleId dựa trên giá trị Reward_points
    if (customer.Reward_points > 100000) {
      customer.roleId = 8; // Cập nhật roleId thành 8 nếu Reward_points > 100000
    } else if (customer.Reward_points > 50000) {
      customer.roleId = 7; // Cập nhật roleId thành 7 nếu Reward_points > 50000
    }

    // Lưu lại thay đổi vào bảng Customer
    await customer.save();

    // Trả về thông tin khách hàng đã được cập nhật
    return res.status(200).json({
      message: 'Reward points and role updated successfully',
      updatedCustomer: customer,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});
// hiển thị tất cả đánh giá sản phẩm không sử dụng điều kiện số sao
const axios = require('axios');  // For making HTTP requests

router.get('/comments/all/start/all', async (req, res) => {
  try {
    // Fetch OrderDetail and CommentProduct without filtering by number_star
    const comments = await models.OrderDetail.findAll({
      include: [
        {
          model: models.ComentProduct,
          attributes: ['id', 'content', 'orderDetailId', 'number_star', 'createdAt'],
          order: [['number_star', 'DESC']]
        },
        {
          model: models.Order,
          attributes: ['custumerID'],
        },
        {
          model: models.Product, // Include Product model to get the name
          attributes: ['name']  // Only fetching the name of the product
        }
      ],
      attributes: ['id', 'ProductID', 'orderID', 'quantity', 'price']
    });

    // Fetch customer email based on custumerID
    const custumerIds = [...new Set(comments.map(comment => comment.Order.custumerID))];
    const customers = await models.Customer.findAll({
      where: { id: custumerIds },
      attributes: ['id', 'email']
    });

    // Map customer emails by custumerID
    const customerMap = customers.reduce((map, customer) => {
      map[customer.id] = customer.email;
      return map;
    }, {});

    // Flatten and process comments to create a single-level structure
    const commentsWithFullData = comments
      .map(comment => {
        const comentProduct = comment.ComentProducts[0]; // Assume each OrderDetail has one ComentProduct
        const productName = comment.Product ? comment.Product.name : null; // Get product name

        return {
          id: comment.id,
          ProductID: productName, // Use product name instead of ProductID
          orderID: comment.orderID,
          quantity: comment.quantity,
          price: comment.price,
          comentProductID: comentProduct ? comentProduct.id : null,
          content: comentProduct ? comentProduct.content : null,
          number_star: comentProduct ? comentProduct.number_star : null,
          createdAt: comentProduct ? comentProduct.createdAt : null,
          email: customerMap[comment.Order.custumerID] || null
        };
      })
      .filter(comment => comment.content !== null) // Filter out comments with null content
      .sort((a, b) => b.id - a.id); // Sort by id in descending order

    // Prepare the data for feedback analysis
    const feedbackRequestData = commentsWithFullData.map(comment => comment.content);

    // Send content data to the Flask API to get feedback
    const response = await axios.post('http://127.0.0.1:8000/api/nanxet', {
      contents: feedbackRequestData
    });

    // Map feedback results to the original comment data
    const commentsWithFeedback = commentsWithFullData.map((comment, index) => ({
      ...comment,
      feedback: response.data.results[index].feedback
    }));

    res.json(commentsWithFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể lấy thông tin OrderDetail và phân tích nhận xét' });
  }
});

// hiển thị tất cả đánh giá sản phẩm không sử dụng điều kiện số sao phân tích bình luận
router.get('/comments/all/start/all1', async (req, res) => {
  try {
    // Fetch OrderDetail and ComentProduct without filtering by number_star
    const comments = await models.OrderDetail.findAll({
      include: [
        {
          model: models.ComentProduct,
          attributes: ['id', 'content', 'orderDetailId', 'number_star', 'createdAt'],
          order: [['number_star', 'DESC']]
        },
        {
          model: models.Order,
          attributes: ['custumerID'],
        },
        {
          model: models.Product, // Include Product model to get the name
          attributes: ['name']  // Only fetching the name of the product
        }
      ],
      attributes: ['id', 'ProductID', 'orderID', 'quantity', 'price']
    });

    // Fetch customer email based on custumerID
    const custumerIds = [...new Set(comments.map(comment => comment.Order.custumerID))];
    const customers = await models.Customer.findAll({
      where: { id: custumerIds },
      attributes: ['id', 'email']
    });

    // Map customer emails by custumerID
    const customerMap = customers.reduce((map, customer) => {
      map[customer.id] = customer.email;
      return map;
    }, {});

    // Flatten and process comments to create a single-level structure
    const commentsWithFullData = comments
      .map(comment => {
        const comentProduct = comment.ComentProducts[0]; // Assume each OrderDetail has one ComentProduct
        const productName = comment.Product ? comment.Product.name : null; // Get product name

        return {
          id: comment.id,
          ProductID: productName, // Use product name instead of ProductID
          orderID: comment.orderID,
          quantity: comment.quantity,
          price: comment.price,
          comentProductID: comentProduct ? comentProduct.id : null,
          content: comentProduct ? comentProduct.content : null,
          number_star: comentProduct ? comentProduct.number_star : null,
          createdAt: comentProduct ? comentProduct.createdAt : null,
          email: customerMap[comment.Order.custumerID] || null
        };
      })
      .filter(comment => comment.content !== null) // Filter out comments with null content
      .sort((a, b) => b.id - a.id); // Sort by id in descending order

    res.json(commentsWithFullData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể lấy thông tin OrderDetail' });
  }
});
// hiển thị tổng cmt, số sao % trên tổng 
router.get('/comments/all/start/all/numberstart', async (req, res) => {
  try {
    // Fetch OrderDetail and ComentProduct without filtering by number_star
    const comments = await models.OrderDetail.findAll({
      include: [
        {
          model: models.ComentProduct,
          attributes: ['number_star']
        }
      ],
    });

    // Flatten and filter comments with a valid `number_star`
    const validComments = comments
      .flatMap(comment => comment.ComentProducts)
      .filter(comentProduct => comentProduct && comentProduct.number_star !== null);

    // Calculate total comments
    const totalComments = validComments.length;

    // Calculate star counts
    const starCounts = validComments.reduce((counts, comentProduct) => {
      const star = comentProduct.number_star || 0;
      counts[star] = (counts[star] || 0) + 1;
      return counts;
    }, {});

    // Generate percentages for each star rating
    const starDistribution = Object.entries(starCounts)
      .map(([star, count]) => ({
        number_star: Number(star),
        count,
        percentage: ((count / totalComments) * 100).toFixed(2) + '%'
      }))
      .sort((a, b) => b.number_star - a.number_star); // Sort by `number_star` descending

    // Return the simplified response
    res.json({
      totalComments,
      starDistribution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể lấy thông tin OrderDetail' });
  }
});


module.exports = router
