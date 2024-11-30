const express = require('express')
const { models } = require('../models')
const { isAuthenticated, checkUserPermission } = require('../middlewares/authentication')
const bcrypt = require('bcrypt')
const SALT_KEY = 10; // Bạn có thể điều chỉnh số vòng muối nếu cần
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const { Op } = require('sequelize');

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

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request: request,
    error: error,
    // user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request: request,
    response: response,
    user: req.user.id
  })
}

// hiển thị user cho quản lý xem: chỉ xem nhân viên
router.get('/', async (req, res) => {
  try {
    const users = await models.User.findAll({
      where: {
        roleId: {
          [Op.or]: [3, 5] // Use OR operator to filter by roleId
        },
        status: 1 // Add condition to filter by status (e.g., active users)
      }
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách người dùng.' });
  }
});


// hiển thị tất cả các user cho admin xem 
router.get('/all', async (req, res) => {
  try {
    const user = await models.User.findAll({
      where: {
        status: 1 // Add condition to filter by status (e.g., active users)
      }
    });
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    // logError(req, error);
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND });
  }
});


// get user pagination
router.get('/pagination', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      sortKey,
      sortDirection
    } = req.query

    const order = (sortKey && sortDirection && sortDirection !== 'none')
      ? sortKey.includes('.')
        ? [[models[sortKey.split('.')[0]], sortKey.split('.')[1], sortDirection]]
        : [[sortKey, sortDirection]]
      : [['id', 'DESC']]

    const dataFromDatabase = await models.User.findAll({
      attributes: ['id', 'username', 'roleId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: models.Role,
          attributes: ['id', 'description']
        }
      ],
      order: order
    })

    const dataAfterNameSearch = applyNameSearch(
      searchCondition,
      dataFromDatabase
    )

    const totalRecords = dataAfterNameSearch.length
    const totalPages = Math.ceil(totalRecords / Number(size))

    const dataOfCurrentWindow = getDataInWindowSize(
      size,
      page,
      dataAfterNameSearch
    )

    res.json({
      page: Number(page),
      size: Number(size),
      totalPages,
      totalRecords,
      currentRecords: dataOfCurrentWindow.length,
      data: dataOfCurrentWindow
    })
    logInfo(req, dataOfCurrentWindow)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND })
  }
})

function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.username?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
    )
  }
  return data
}

function getDataInWindowSize (size, page, data) {
  if (!isNaN(Number(size)) && !isNaN(Number(page))) {
    data = data.slice(
      Number(size) * (Number(page) - 1),
      Number(size) * Number(page)
    )
  }
  return data
}

// create user
// const SALT_KEY = 10; // Độ mạnh của salt (bạn có thể điều chỉnh nếu cần)

// Định nghĩa API để thêm người dùng
router.post('/', async (req, res) => {
  try {
    console.log('Incoming request body:', req.body); // Log the request body for debugging

    // Trích xuất các trường từ req.body, bao gồm cả roleId
    const { fullName, email, gender, age, username, address, phone, password = '111', status ='1', roleId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || email.trim() === '') {
      return res.status(400).json({ message: 'Email là bắt buộc.' });
    }

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Người dùng đã tồn tại với email này.' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = bcrypt.hashSync(password, SALT_KEY);

    // Tạo đối tượng người dùng mới với roleId
    const newUser = {
      fullName,
      email,
      gender,
      age,
      password: hashedPassword, // Sử dụng mật khẩu đã mã hóa
      username,
      address,
      phone,
      roleId, // Thêm roleId vào đối tượng người dùng
      status
    };

    // Lưu người dùng mới vào cơ sở dữ liệu
    const createdUser = await models.User.create(newUser);

    // Trả về thông tin người dùng đã tạo
    res.status(201).json({ message: 'Người dùng đã được tạo thành công.', user: createdUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi tạo người dùng.' });
  }
});


 
// Chỉnh sửa người dùng 
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from URL parameters
    const { fullName, email, gender, age, password, username, address, phone, roleId } = req.body;

    // Log the input values for debugging
    console.log('User input for update:', req.body);

    // Check if the user exists
    const existingUser = await models.User.findByPk(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User does not exist.' });
    }

    // Check if the email has changed and is already taken
    if (email && email !== existingUser.email) {
      const duplicateUser = await models.User.findOne({ where: { email } });
      if (duplicateUser) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
    }

    // Update user information
    const updatedUser = {
      fullName: fullName || existingUser.fullName,
      email: email || existingUser.email,
      gender: gender || existingUser.gender,
      age: age || existingUser.age,
      password: password ? bcrypt.hashSync(password, SALT_KEY) : existingUser.password, // Only hash password if changed
      username: username || existingUser.username,
      address: address || existingUser.address,
      phone: phone || existingUser.phone,
      roleId: roleId !== undefined ? roleId : existingUser.roleId // Update roleId if present in request
    };

    // Save updated user info to database
    await existingUser.update(updatedUser);

    // Return updated user information
    res.status(200).json({ message: 'User information has been successfully updated.', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating user information.' });
  }
});


// delete user
router.put('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's status to 0
    user.status = 0;
    await user.save();

    res.json({ message: 'User status updated to 0 successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'An error occurred while updating user status.' });
  }
});

// find user by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await models.User.findByPk(id)
    if (!user) {
      // logError(req, MASSAGE.USER_NOT_FOUND)
      return res.status(404).json({ message: MASSAGE.USER_NOT_FOUND })
    }
    // logInfo(req, user)
    res.json(user)
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: MASSAGE.USER_NOT_FOUND })
  }
})

module.exports = router
