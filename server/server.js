const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { sequelize } = require('./models')
const initDataController = require('./controllers/init-data')
const examController = require('./controllers/exam')
const questionAdminController = require('./controllers/question_admin')
const questionController = require('./controllers/question')
const authController = require('./controllers/auth')
const roleController = require('./controllers/role')
const permissionController = require('./controllers/permission')
const userController = require('./controllers/user')
const CartController = require('./controllers/cart')
const customerController = require('./controllers/customer')
const roleToPermissionController = require('./controllers/role_to_permission')
const routeController = require('./controllers/route')
const courseController = require('./controllers/product')
const learningController = require('./controllers/learning')
const categoryCourseController = require('./controllers/category_product') // categorycourse
const homeUser = require('./controllers/home') // homeUser
const order = require('./controllers/order') // order
const chatbot = require('./controllers/chatbot') // homeUser


const lessionController = require('./controllers/lession')
const seedDatabase = require('./seeds/index')
const { API_PREFIX } = require('./utils')

const app = express()

app.set('trust proxy', true)

// TODO: apply redis later
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization')
//   res.setHeader('Access-Control-Allow-Credentials', true)
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200)
//   }
//   next()
// })
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))

app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(`${API_PREFIX}/auth`, authController)
app.use(`${API_PREFIX}/init-data`, initDataController)
app.use(`${API_PREFIX}/exams`, examController)
app.use(`${API_PREFIX}/question_admin`, questionAdminController)
app.use(`${API_PREFIX}/questions`, questionController)
app.use(`${API_PREFIX}/product`, courseController)
app.use(`${API_PREFIX}/learn`, learningController)
app.use(`${API_PREFIX}/lessions`, lessionController)

// app.use(`${API_PREFIX}/dashboard`, dashboardController)
app.use(`${API_PREFIX}/roles`, roleController)
app.use(`${API_PREFIX}/permissions`, permissionController)
app.use(`${API_PREFIX}/users`, userController)
app.use(`${API_PREFIX}/customer`, customerController)
app.use(`${API_PREFIX}/cart`, CartController)

app.use(`${API_PREFIX}/role_to_permission`, roleToPermissionController)
app.use(`${API_PREFIX}/routes`, routeController)
app.use(`${API_PREFIX}/product`, courseController)// course
app.use(`${API_PREFIX}/categoryproduct`, categoryCourseController)// categorycourse
app.use(`${API_PREFIX}/homeuser`, homeUser)// categorycourse
app.use(`${API_PREFIX}/order`, order)// pay
app.use(`${API_PREFIX}/chatbot`, chatbot)// pay

async function startServer () {
  try {
    await sequelize.sync()
    console.log('Database synchronized successfully')
    await seedDatabase()
    console.log('Data seeded successfully')

    app.listen(process.env.PORT, () => {
      console.log('Server is running')
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer()
