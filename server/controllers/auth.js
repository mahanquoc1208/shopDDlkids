const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const randToken = require('rand-token')
const { errorLogger, infoLogger } = require('../logs/logger')

const CryptoJS = require('crypto-js')

const {
  SALT_KEY,
  generateToken,
  REFRESH_TOKEN_SIZE
} = require('../utils')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, gender, age, address, phone } = req.body.data;
    console.log(email);
    
    // Check if the email already exists in the Customer table
    const customer = await models.Customer.findOne({
      where: { email }
    });

    if (customer) {
      return res.status(409).json({
        code: 409,
        message: 'Email đã tồn tại'
      });
    } else {
      const hashPassword = bcrypt.hashSync(password, SALT_KEY);
      const newCustomer = {
        email,
        password: hashPassword,
        fullName,
        gender,
        age,
        address,
        phone
      };
      
      // Create new customer
      const createdCustomer = await models.Customer.create(newCustomer);
      if (!createdCustomer) {
        return res.status(400).json({
          code: 400,
          message: 'Lỗi Hệ thống.'
        });
      }
      
      return res.json({
        email,
        status: 'Đăng kí thành công'
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
});

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body.data;
//     const customer = await models.Customer.findOne({
//       where: { email }
//     });

//     if (!customer) {
//       return res.status(401).json({
//         code: 401,
//         message: 'Login failed.'
//       });
//     }

//     const isPasswordValid = bcrypt.compareSync(password, customer.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         code: 401,
//         message: 'Login failed.'
//       });
//     }

//     const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
//     const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

//     const dataForAccessToken = {
//       id: customer.id,
//       email: customer.email // Include relevant info
//     };

//     const accessToken = await generateToken(
//       dataForAccessToken,
//       accessTokenSecret,
//       accessTokenLife
//     );

//     if (!accessToken) {
//       return res.status(401).json({ code: 401, message: 'Login failed.' });
//     }

//     let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE);
//     if (!customer.refreshToken) {
//       customer.set({ refreshToken });
//       await customer.save();
//     } else {
//       refreshToken = customer.refreshToken;
//     }

//     const expiredToken = new Date();
//     expiredToken.setMonth(expiredToken.getMonth() + 1);
//     await models.Customer.update({ expiredToken }, { where: { id: customer.id } });

//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       sameSite: 'Strict',
//       maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
//     });

//     return res.json({
//       accessToken,
//       email: customer.email,
//       id: customer.id,
//       firstName: customer.firstName,
//       lastName: customer.lastName
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({ error });
//   }
// });
// mới 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body.data;

    // Tìm người dùng trong bảng Customer
    let user = await models.Customer.findOne({
      where: { email },
      include: [{
        model: models.Role,
        attributes: ['description']
      }]
    });
    let userType = 'customer';

    // Nếu không tìm thấy trong bảng Customer, tìm trong bảng User
    if (!user) {
      user = await models.User.findOne({
        where: { email },
        include: [{
          model: models.Role,
          attributes: ['description']
        }]
      });
      userType = 'user';
    }

    // Kiểm tra nếu không tìm thấy người dùng trong cả hai bảng
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: 'Email không chính xác'
      });
    }

    // Kiểm tra nếu tài khoản bị xóa
    if (user.status === 0) {
      return res.status(403).json({
        code: 403,
        message: 'Tài khoản của bạn đã bị xóa'
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: 'Sai mật khẩu'
      });
    }

    // Cấu hình token
    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

    const dataForAccessToken = {
      id: user.id,
      email: user.email,
      userType: userType
    };

    // Tạo access token
    const accessToken = await generateToken(dataForAccessToken, accessTokenSecret, accessTokenLife);
    if (!accessToken) {
      return res.status(401).json({ code: 401, message: 'Login failed.' });
    }

    // Xử lý refresh token
    let refreshToken = randToken.generate(REFRESH_TOKEN_SIZE);
    if (!user.refreshToken) {
      user.set({ refreshToken });
      await user.save();
    } else {
      refreshToken = user.refreshToken;
    }

    // Cập nhật thời gian hết hạn của refresh token
    const expiredToken = new Date();
    expiredToken.setMonth(expiredToken.getMonth() + 1);
    if (userType === 'customer') {
      await models.Customer.update({ expiredToken }, { where: { id: user.id } });
    } else {
      await models.User.update({ expiredToken }, { where: { id: user.id } });
    }

    // Thiết lập refresh token trong cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
    });

    // Trả về thông tin đăng nhập thành công, bao gồm `roleId`, `description`, và `fullName`
    const fullName = user.fullName

    return res.json({
      accessToken,
      email: user.email,
      id: user.id,
      // firstName: user.firstName,
      // lastName: user.lastName,
      fullName,  // Add fullName to response
      userType,
      roleId: user.roleId,
      roleDescription: user.Role?.description // Thêm description của role vào response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});



router.post('/logout', async (req, res, next) => {
  console.log('LOGGGGOUTTTTTTTTTTTT')
  try {
    const { refreshToken } = req.cookies
    console.log(refreshToken, 'refreshTokenNnNnNnN')
    if (!refreshToken) {
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    const user = await models.User.findByPk(userId)
    res.cookie('refreshToken', '', { expires: new Date(0) })
    user.refreshToken = null
    user.expiredToken = null
    await user.save()
    return res.status(200).json({ message: 'Logout success!' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
})
router.post('/refresh', async (req, res, next) => {
  console.log('REFRESH TOKENNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN')
  try {
    console.log(req.cookies, 'req.cookies')
    const refreshToken = req.cookies.refreshToken
    console.log(refreshToken, 'refreshToken')
    if (!refreshToken) {
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    const userId = await verifyRefreshToken(refreshToken)
    if (!userId) {
      res.cookie('refreshToken', '', { expires: new Date(0) })
      return res.status(403).json({ error: { message: 'Unauthorized' } })
    }
    console.log(userId, 'userIddddddddddddddddddddddddddddddd')
    const user = await models.User.findByPk(userId)

    const accessTokenLife = process.env.ACCESS_TOKEN_LIFE
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

    const getGroupWithRoles = async (user) => {
      const roles = await models.Role.findOne({
        where: { id: user.roleId },
        attributes: ['id', 'name', 'description'],
        include: {
          model: models.Permission,
          attributes: ['id', 'name', 'description', 'url', 'method'],
          through: { attributes: [] }
        }
      })
      return roles
    }

    const dataForAccessToken = {
      id: user.id,
      GroupWithRoles: await getGroupWithRoles(user)
    }
    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    )
    const encryptedGroupWithRoles = CryptoJS.AES.encrypt((dataForAccessToken.GroupWithRoles.description), 'Access_Token_Secret_#$%_ExpressJS_Authentication').toString()
    return res.json({
      accessToken,
      username: user.username,
      key: encryptedGroupWithRoles,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    })
  } catch (error) {
    console.log(error, 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDĐ')
    res.json({ error: { message: 'dddddddddddddd' } })
  }
})
const verifyRefreshToken = async (refreshToken) => {
  try {
    const user = await models.User.findOne({ where: { refreshToken } })
    if (!user) {
      throw new Error('Token not found')
    }
    const now = new Date()
    if (user.expiredToken < now || !user.expiredToken) {
      console.log('Token has expired')
      user.expiredToken = null
      await user.save()
      throw new Error('Token has expired')
    }
    return user.id
  } catch (err) {
    return null
  }
}

module.exports = router
