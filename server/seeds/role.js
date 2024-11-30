const { fakerEN: faker } = require('@faker-js/faker')
const Role = require('../models/role')

const roles = [
  { id: 1, name: 'R1', description: 'Chủ cửa hàng' },
  { id: 2, name: 'R2', description: 'Quản lý' },
  { id: 3, name: 'R3', description: 'Nhân viên xử lý đơn hàng' },
  { id: 5, name: 'R5', description: 'Nhân viên vận chuyển' },
  { id: 6, name: 'R6', description: 'Khách hàng thường' },
  { id: 7, name: 'R7', description: 'Khách hàng kim cương' },
  { id: 8, name: 'R8', description: 'Khách hàng vip' }
]

const seedRoles = async () => {
  try {
    const count = await Role.count()
    if (count === 0) {
      await Role.bulkCreate(roles, { validate: true })
    } else {
      console.log('Roles table is not empty.')
    }
  } catch (error) {
    console.log(`Failed to seed Roles data: ${error}`)
  }
}

module.exports = seedRoles
