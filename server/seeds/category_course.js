const { fakerEN: faker } = require('@faker-js/faker')
const CategoryCourse = require('../models/category_product')

// const generateName = () => {
//   const randomNumber = Math.floor(Math.random() * 3) + 1
//   if (randomNumber === 1) {
//     return 'Multiple Choice'
//   } else if (randomNumber === 2) {
//     return 'Essay'
//   } else {
//     return 'Fill-in-the-blank'
//   }
// }

const sampleNames = ['Sữa cho bé','Khẩu trang cho bé','Giặc xả và tắm gội','Vitamin và sức khỏe','Phụ kiện của bé'



]

const sampleDescriptions = [
  'Vẫn là sữa bò tươi nguyên chất 100% được vắt và đóng hộp ngay trong ngày với gấp 2 lần hiệu quả hấp thu Canxi và đạt 400 tiêu chuẩn sạch tinh khiết của Hoa Kỳ. Nay có thêm vị dừa mới - vừa tươi vừa ngon, đa dạng lựa chọn cho người',
  'Bảo vệ sức khỏe của bé yêu với những chiếc khẩu trang chất lượng cao, được thiết kế vừa vặn và an toàn cho làn da nhạy cảm của trẻ. Chất liệu mềm mại, thoáng khí giúp bé thoải mái trong mọi hoạt động',
  'Bắt đầu hành trình ăn dặm của bé với các sản phẩm hỗ trợ bữa ăn an toàn và tiện lợi. Được thiết kế để phù hợp với từng giai đoạn phát triển, giúp bé tập làm quen với việc ăn uống tự lập một cách dễ dàng.',
  'Chăm sóc toàn diện cho bé từ việc tắm gội đến giặt xả quần áo. Sản phẩm dịu nhẹ, không chứa hóa chất độc hại, giúp giữ cho làn da bé luôn sạch sẽ, thơm mát và quần áo mềm mại.',
  'Cung cấp đầy đủ dưỡng chất cho sự phát triển toàn diện của bé với các sản phẩm vitamin và bổ sung sức khỏe. Được kiểm nghiệm kỹ lưỡng, đảm bảo an toàn cho trẻ nhỏ, giúp bé luôn khỏe mạnh và tràn đầy năng lượng.',
  'Lựa chọn bình sữa và các phụ kiện đi kèm chất lượng cao, an toàn cho bé. Thiết kế tiện dụng, dễ vệ sinh và phù hợp với từng giai đoạn bú sữa của bé, giúp mẹ yên tâm trong suốt quá trình nuôi con.',
  ''
]

const generateCategoryCourse = async () => {
  const categoryCourses = []

  for (let i = 0; i < sampleNames.length; i++) {
    const name = sampleNames[i]
    const description = sampleDescriptions[i]

    categoryCourses.push({
      name,
      description,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    })
  }

  return categoryCourses
}

const seedCategoryCourses = async () => {
  const categoryCourses = await generateCategoryCourse()
  try {
    const count = await CategoryCourse.count()
    if (count === 0) {
      await CategoryCourse.bulkCreate(categoryCourses, { validate: true })
    } else {
      // console.log('categoryCourses table is not empty.')
    }
  } catch (error) {
    // console.log(`Failed to seed categoryCourses data: ${error}`)
  }
}

module.exports = seedCategoryCourses
