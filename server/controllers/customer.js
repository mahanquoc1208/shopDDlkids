const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const {
  SALT_KEY
} = require('../utils')

const router = express.Router()
// const { infoLogger, errorLogger } = require('../logs/logger')

const MASSAGE = {
  USER_NOT_FOUND: 'User not found',
  NO_CREATE_USER: 'No can not create user',
  NO_UPDATE_USER: 'No can not update user',
  NO_DELETE_USER: 'No can not delete user',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  REQUIRED: 'Username or password or roleId are required',
  ROLE_NOT_FOUND: 'Role not found',
  DELETE_USER_SUCCESS: 'Delete user successfully',
  UPDATE_USER_SUCCESS: 'Update user',
  UPDATE_USER_ERROR: 'You can not update user role',
  NO_UPDATE: 'Current Password is incorrect'
}

// function logError (req, error) {
//   const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
//   errorLogger.error({
//     message: `Error ${req.path}`,
//     method: req.method,
//     endpoint: req.path,
//     request: request,
//     error: error,
//     user: req.user.id
//   })
// }

// function logInfo (req, response) {
//   const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
//   infoLogger.info({
//     message: `Accessed ${req.path}`,
//     method: req.method,
//     endpoint: req.path,
//     request: request,
//     response: response,
//     user: req.user.id
//   })
// }
// cập nhật thông tin khách hàng
router.put('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const {
      fullName,
      email,
      age,
      address,
      phone
    } = req.body;

    // Tìm kiếm khách hàng theo ID
    const customer = await models.Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Invalid input: fullName and email are required' });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Cập nhật thông tin khách hàng chỉ với các trường cần thiết
    await customer.update({
      fullName,
      email,
      age,
      address,
      phone
    });

    // Ghi log thông tin đã cập nhật
    console.log('Customer updated:', customer);

    // Trả về thông báo thành công
    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// xóa khách hàng
// API to soft delete a customer by setting status = 0
router.put('/delete/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    // Find customer by ID
    const customer = await models.Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update the status to 0 to mark the customer as deleted
    await customer.update({
      status: 0
    });

    // Log the deletion action
    console.log('Customer soft deleted (status set to 0):', customer);

    // Return success response
    res.json({ message: 'Customer deleted successfully (soft delete)', customer });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// gét 1 khách hàng
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch customer by specific id, status = 1, and include the role name
    const customer = await models.Customer.findOne({
      where: { id: id, status: 1 },
      include: [
        {
          model: models.Role, // Reference to the Role model
          attributes: ['description'], // Only fetch the 'name' field from the Role table
        },
      ],
    });

    // If customer not found, return 404
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Format the response to include all the fields and the role name
    const formattedCustomer = {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      gender: customer.gender,
      age: customer.age,
      password: customer.password,
      username: customer.username,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      address: customer.address,
      phone: customer.phone,
      status: customer.status,
      reward_points: customer.Reward_points, // Assuming 'Reward_points' is correctly defined in your model
      roleId: customer.roleId,
      role: customer.Role.description, // Add role name from the Role model
      custumerId: customer.custumerId,
    };

    res.json(formattedCustomer); // Return the formatted customer data
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving customer' });
  }
});


// get all khách hàng
router.get('/', async (req, res) => {
  try {
    // Fetch only customers with status = 1
    const activeCustomers = await models.Customer.findAll({
      where: { status: 1 }
    });

    // logInfo(req, activeCustomers);
    res.json(activeCustomers);
  } catch (error) {
    // logError(req, error);
    res.status(500).json({ message: 'User not found' });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, gender, age, address, phone } = req.body.data;
    
    const existingCustomer = await models.Customer.findOne({
      where: { username }
    });

    if (existingCustomer) {
      return res.status(409).json({ code: 409, message: 'Tên đăng nhập đã tồn tại' });
    }

    const hashPassword = bcrypt.hashSync(password, SALT_KEY);
    const newCustomer = {
      username,
      password: hashPassword,
      fullName,
      email,
      gender,
      age,
      address,
      phone
    };

    const createdCustomer = await models.Customer.create(newCustomer);
    if (!createdCustomer) {
      return res.status(400).json({ code: 400, message: 'Lỗi Hệ thống.' });
    }

    return res.json({ username, status: 'Đăng kí thành công' });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
});
// sửa thông tin từ khách hàng
router.put('/update-customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, gender, age, address, phone, password } = req.body;

    // Tìm kiếm khách hàng
    const customer = await models.Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ code: 404, message: 'Khách hàng không tồn tại' });
    }

    // Chuẩn bị dữ liệu cập nhật chỉ với các trường có giá trị
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (gender !== undefined) updateData.gender = gender;
    if (age !== undefined) updateData.age = age;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    // Chỉ mã hóa và cập nhật mật khẩu nếu có mật khẩu mới
    if (password) {
      updateData.password = bcrypt.hashSync(password, SALT_KEY);
    }

    // Cập nhật thông tin khách hàng
    await customer.update(updateData);

    return res.json({ code: 200, message: 'Thông tin khách hàng đã được cập nhật thành công' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 500, message: 'Lỗi hệ thống', error });
  }
});

module.exports = router
