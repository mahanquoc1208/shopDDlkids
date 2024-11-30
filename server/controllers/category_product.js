const express = require('express')
const { models } = require('../models')
const router = express.Router()
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
router.get('/', async (req, res) => {
  try {
    // Lấy danh sách các category_course từ cơ sở dữ liệu với điều kiện status = 1
    const categoryCourses = await models.CategoryCourse.findAll({
      attributes: ['id', 'name', 'description', 'status', 'createdAt', 'updatedAt'],
      where: { status: 1 }, // Chỉ lấy các bản ghi có status = 1
      order: [['id', 'DESC']] // Sắp xếp theo id giảm dần
    });

    // Trả về kết quả
    res.json({
      data: categoryCourses
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: MESSAGES1.INTERNAL_SERVER_ERROR });
  }
});

const MESSAGES = {
  CATEGORY_COURSE_DELETED: 'Category Product deleted successfully',
  CATEGORY_COURSE_NOT_FOUND: 'Category Product not found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  FOREIGN_KEY_CONSTRAINT_ERROR: 'Cannot delete category_course because it is referenced by other tables'
}

router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Tiến hành cập nhật status của category_course thành 0
    const [updatedRowsCount] = await models.CategoryCourse.update(
      { status: 0 }, // Cập nhật cột status thành 0
      { where: { id: categoryId } }
    );

    if (updatedRowsCount > 0) {
      logInfo(req, { id: categoryId, status: 0 });
      res.json({ message: MESSAGES.CATEGORY_COURSE_DEACTIVATED });
    } else {
      logError(req, MESSAGES.CATEGORY_COURSE_NOT_FOUND);
      res.status(404).json({ error: MESSAGES.CATEGORY_COURSE_NOT_FOUND });
    }
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      // Nếu là lỗi dính khóa ngoại, in ra tên của category_course
      const categoryCourseId = req.params.id;
      const categoryCourse = await models.CategoryCourse.findOne({ where: { id: categoryCourseId } });
      logInfo(req, error);
      res.status(409).json({ 
        error: MESSAGES.FOREIGN_KEY_CONSTRAINT_ERROR, 
        categoryCourseName: categoryCourse ? categoryCourse.name : null 
      });
    } else {
      // Nếu là lỗi khác, trả về thông báo lỗi nội bộ
      logError(req, MESSAGES.INTERNAL_SERVER_ERROR);
      res.status(500).json({ error: MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
});

// API để thêm một category_course mới
const MESSAGES2 = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  CATEGORY_COURSE_EXISTS: 'Category Product with this name already exists.',
  INVALID_INPUT: 'Name and description are required.'
}
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Kiểm tra xem name và description có giá trị không
    if (!name.trim()) {
      logError(req, MESSAGES2.INVALID_NAME);
      return res.status(400).json({ error: MESSAGES2.INVALID_NAME });
    }
    if (!description.trim()) {
      return res.status(400).json({ error: MESSAGES2.INVALID_DESCRIPTION });
    }

    // Kiểm tra xem category_course có tồn tại không
    const existingCategoryCourse = await models.CategoryCourse.findOne({ where: { name } });
    if (existingCategoryCourse) {
      return res.status(409).json({ error: MESSAGES2.CATEGORY_COURSE_EXISTS });
    }

    // Tạo một category_course mới trong cơ sở dữ liệu
    const newCategoryCourse = await models.CategoryCourse.create({
      name,
      description,
      status: 1 // Thêm trạng thái mặc định
    });

    logInfo(req, newCategoryCourse);
    res.status(201).json(newCategoryCourse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: MESSAGES2.INTERNAL_SERVER_ERROR });
  }
});

// sửa danh mục
const MESSAGES3 = {
  CATEGORY_COURSE_NOT_FOUND: 'Category Product not found.',
  INVALID_INPUT: 'Name and description are required.',
  CATEGORY_COURSE_EXISTS: 'Category Product with this name already exists.',
  CATEGORY_COURSE_UPDATED: 'Category Product updated successfully.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error.'
}
// API để sửa đổi một category_course
router.put('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id
    const { name, description } = req.body

    // Kiểm tra xem category_course có tồn tại không
    const categoryCourse = await models.CategoryCourse.findByPk(categoryId)
    if (!categoryCourse) {
      return res.status(404).json({ error: MESSAGES3.CATEGORY_COURSE_NOT_FOUND })
    }

    // Kiểm tra xem name và description có giá trị không
    if (!name.trim() || !description.trim()) {
      logError(req, MESSAGES3.INVALID_INPUT)
      return res.status(400).json({ error: MESSAGES3.INVALID_INPUT })
    }

    // Sửa đổi thông tin category_course
    await categoryCourse.update({ name, description })
    logInfo(req, categoryCourse)

    res.json({ message: MESSAGES3.CATEGORY_COURSE_UPDATED, categoryCourse })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: MESSAGES3.INTERNAL_SERVER_ERROR })
  }
})
const MESSAGES5 = {
  CategoryCourse_NOT_FOUND: 'CategoryCourse not found.',
  FAILED_TO_FETCH_CategoryCourse: 'Failed to fetch CategoryCourse.'
}
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const CategoryCourse = await models.CategoryCourse.findByPk(id)
    if (!CategoryCourse) {
      return res.status(404).json({ message: MESSAGES5.COURSE_NOT_FOUND })
    }
    res.json(CategoryCourse)
  } catch (error) {
    res.status(500).json({ message: MESSAGES5.FAILED_TO_FETCH_CategoryCourse, error: error.message })
  }
})

// API để kiểm tra xem tên danh mục khóa học đã tồn tại hay chưa
module.exports = router
