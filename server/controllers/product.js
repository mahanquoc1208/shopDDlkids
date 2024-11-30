const express = require('express')
const { models } = require('../models')
// const { isAuthenticated } = require('../middlewares/authentication')
const { Sequelize } = require('sequelize'); // Import Sequelize để sử dụng literal
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')
// const { Client } = require('@elastic/elasticsearch')
// const esClient = new Client({ node: 'http://localhost:9200' })
// const { Op } = require('../../client/public/assets/images/uploads/product')
// function logError (req, error) {
//   const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
//   errorLogger.error({
//     message: `Error ${req.path}`,
//     method: req.method,
//     endpoint: req.path,
//     request,
//     error: error.message,
//     user: req.user.id
//   })
// }

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user.id
  })
}

router.get('/course-category', async (req, res) => {
  try {
    const courseCategory = await getCourseCategory()
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.query,
      response: courseCategory,
      user: req.user?.id // Optional chaining in case req.user is undefined
    })
    res.json(courseCategory)
  } catch (error) {
    // logError(req, error)
    console.log(error)
    res.status(500).json({ message: jsonError })
  }
})


module.exports = router

async function getCourseCategory () {
  return await models.CategoryCourse.findAll({
    order: [['id', 'DESC']],
    where: { status: 1 }
  })
}
// router.get('/course-category', async (req, res) => {
//   console.log()
//   try {
//     const courseCategory = await getCourseCategory()
//     logInfo(req, courseCategory)
//     res.json(courseCategory)
//   } catch (error) {
//     // logError(req, error)
//     res.status(500).json(error)
//   }
// })

router.get('/all', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 4; // Number of courses per page
  const offset = (page - 1) * limit; // Calculate the offset

  try {
    const { count, rows } = await models.Product.findAndCountAll({
      where: {
        publicStatus: {
          [Op.in]: [1, 2], // Public status 1 or 2
        },
        publicDate: {
          [Op.lt]: new Date(), // Only courses before the current date
        },
        status: 1, // Only active courses
        Inventory_quantity: {           
          [Op.gt]: 0 // Inventory quantity greater than 0         
        }   
      },
      include: [
        {
          model: models.CategoryCourse,
          where: { status: 1 }, // Only include categories with status = 1
          required: true, // Ensure only products with valid categories are included
        },
      ],
      order: [['id', 'ASC']], // Order by id in descending order
      limit,
      offset,
    });

    const dataFromDatabase = await Promise.all(
      rows.map(async (course) => {
        let userAge = null;
        if (course.assignedBy) {
          const author = await models.User.findByPk(course.assignedBy, {
            attributes: ['age'], // Fetch the 'age' attribute
          });
          if (author) {
            userAge = author.age;
          }
        }

        return {
          id: course.id,
          name: course.name,
          summary: course.summary,
          Discount: course.Discount,
          locationPath: course.locationPath,
          description: course.description,
          price: course.price,
          categoryCourseName: course.CategoryCourse ? course.CategoryCourse.name : null,
          assignedBy: userAge, // Add the 'age' to the response
        };
      })
    );

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      data: dataFromDatabase,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error); // Replace with logError(req, error) if you have a logging mechanism
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

router.get('/all2/:categoryCourseId', async (req, res) => {
  const { categoryCourseId } = req.params; // Get categoryCourseId from URL parameters
  const page = parseInt(req.query.page) || 1; // Get page number from query params, default is 1

  // Số lượng sản phẩm trên mỗi trang
  const size = 4;

  try {
    // Calculate offset based on current page
    const offset = (page - 1) * size;

    // Fetch courses with the given conditions, sorting randomly
    const listCourses = await models.Product.findAll({
      where: {
        categoryCourseId, // Filter by categoryCourseId from URL
        publicStatus: {
          [Op.in]: [1, 2], // Public status 1 or 2
        },
        publicDate: {
          [Op.lt]: new Date(), // Only courses before the current date
        },
        status: 1, // Only active products
        Inventory_quantity: {           
          [Op.gt]: 0 // Inventory quantity greater than 0         
        }
      },
      include: [
        {
          model: models.CategoryCourse,
          where: { status: 1 }, // Only include categories with status = 1
          required: true, // Ensure the product has a valid category
        },
      ],
      order: Sequelize.literal('RAND()'), // Sắp xếp ngẫu nhiên kết quả mỗi lần truy vấn
      offset, // Apply offset for pagination
      limit: size, // Limit results to 4 items per page
    });

    // Map the results to the required structure
    const dataFromDatabase = listCourses.map((course) => ({
      id: course.id,
      name: course.name,
      locationPath: course.locationPath,
      description: course.description,
      price: course.price,
      Discount: course.Discount,
      prepare: course.prepare,
      categoryCoursename: course.CategoryCourse ? course.CategoryCourse.name : null,
    }));

    res.json({
      data: dataFromDatabase,
      currentPage: page,
      pageSize: size, // Return the size to the client for reference
    });
  } catch (error) {
    console.error(error); // Replace with logError(req, error) if you have a logging mechanism
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});


router.get('/category_courses/:categoryCourseId', async (req, res) => {
  const { categoryCourseId } = req.params // Get categoryCourseId from URL parameters

  try {
    const listCourses = await models.Product.findAll({
      where: { categoryCourseId }, // Filter by categoryCourseId from URL
      include: [models.CategoryCourse],
      order: [['id', 'DESC']]
    })

    const coursePromises = listCourses.map(async (course) => {
      let username = null
      if (course.assignedBy) {
        const author = await models.User.findByPk(course.assignedBy, {
          attributes: ['fullName']
        })
        if (author) {
          username = author.username
        }
      }

      return {
        id: course.id,
        name: course.name,
        summary: course.summary,
        assignBy: username,
        durationInMinute: course.durationInMinute,
        startDate: course.startDate,
        endDate: course.endDate,
        locationPath: course.locationPath,
        description: course.description,
        price: course.price,
        prepare: course.prepare,
        categoryCoursename: course.CategoryCourse ? course.CategoryCourse.name : null
      }
    })

    const dataFromDatabase = await Promise.all(coursePromises)

    res.json({ data: dataFromDatabase })
  } catch (error) {
    console.error(error) // Replace with logError(req, error) if you have a logging mechanism
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message })
  }
})
router.get('/all1', async (req, res) => {
  try {
    // Fetch products with associated CategoryCourse filtered by status = 1
    const listCourses = await models.Product.findAll({
      where: { status: 1 }, // Filter products by status = 1
      include: [
        {
          model: models.CategoryCourse,
          where: { status: 1 }, // Filter CategoryCourse by status = 1
          required: true, // Ensure only products with valid CategoryCourse are included
        },
      ],
      order: [['id', 'DESC']], // Sort by ID in descending order
    });

    // Process each course to include additional details
    const coursePromises = listCourses.map(async (course) => {
      let username = null;
      if (course.assignedBy) {
        const author = await models.User.findByPk(course.assignedBy, {
          attributes: ['fullName'],
        });
        if (author) {
          username = author.fullName; // Correct field for fullName
        }
      }
      return {
        id: course.id,
        name: course.name,
        Inventory_quantity: course.Inventory_quantity,
        assignBy: username,
        Discount: course.Discount,
        locationPath: course.locationPath,
        description: course.description,
        price: course.price,
        categoryCoursename: course.CategoryProduct ? course.CategoryProduct.name : null
      };
    });

    // Wait for all promises to resolve
    const dataFromDatabase = await Promise.all(coursePromises);

    // Send the response
    res.json({ data: dataFromDatabase });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product by ID and ensure the status is 1 (active)
    const course = await models.Product.findOne({
      where: { 
        id, 
        status: 1, // Ensure product is active
        Inventory_quantity: { [Op.gt]: 0 } // Ensure inventory quantity is greater than 0
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    // Fetch categoryCourse and ensure the status is 1 (active)
    const categoryCourse = await getCourseCategory();
    const activeCategory = categoryCourse?.find((e) => course.categoryCourseId === e.id && e.status === 1);

    if (!activeCategory) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    // Prepare response data
    const response = {
      ...course.toJSON(),
      categoryCourseId: course.categoryCourseId,  // Adding the categoryCourseId field
      categoryCourseName: activeCategory.name,   // Use the active category's name
    };

    // Convert Discount to a number and check if it's 0
    if (parseFloat(response.Discount) === 0.00) {
      response.Discount = null;
    }

    res.json(response);
  } catch (error) {
    // logError(req, error)
    res.status(500).json({ message: 'Failed to fetch Product', error: error.message });
  }
});


const MESSAGES6 = {
  COURSE_NOT_FOUND: 'Product not found.',
  DELETED_COURSE: 'Deleted Product.',
  CANNOT_DELETE_COURSE: 'Cannot delete product due to existing references.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error.'
}
// viết api xóa bằng lệnh update cột status =0
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await models.Product.findByPk(id);

    if (!course) {
      // logError(req, MESSAGES6.COURSE_NOT_FOUND)
      return res.status(404).json({ message: MESSAGES6.COURSE_NOT_FOUND });
    }

    // Update the status to 0 instead of deleting the Product
    await course.update({ status: 0 });

    // Remove image deletion code
    /*
    const imagePath = path.resolve(__dirname, '../../client/public/assets/images/uploads/product', course.locationPath);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Failed to delete image file:', err);
      } else {
        console.log('Image file deleted:', imagePath);
      }
    });
    */

    res.json({ message: MESSAGES6.DELETED_COURSE });
    // logInfo(req, course);
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      // logInfo(req, error);
      return res.status(409).json({ message: MESSAGES6.CANNOT_DELETE_COURSE });
    }
    // If it's another error, return an error message
    // logError(req, MESSAGES6.INTERNAL_SERVER_ERROR);
    res.status(500).json({ message: MESSAGES6.INTERNAL_SERVER_ERROR });
  }
});


const MESSAGES = {
  BAD_REQUEST_CATEGORY_COURSE_ID: 'categoryCourseId cannot be empty',
  BAD_REQUEST_NAME: 'name cannot be empty',
  BAD_REQUEST_DATE_TYPE: 'startDate and endDate must be integers',
  CONFLICT_NAME_EXISTS: 'A product with this name already exists',
  INTERNAL_SERVER_ERROR: 'Internal Server Error'
}
const MESSAGES4 = {
  COURSE_NOT_FOUND: 'Product not found.',
  INTERNAL_SERVER_ERROR: 'Please select a Product category.',
  DUPLICATE_COURSE_NAME: 'Product name already exists.',
  INVALID_INPUT_ASSIGNEDBY: 'assignedBy must be a number',
  INVALID_INPUT_PRICE: 'price must be a number',
  INVALID_INPUT_Discount: 'Discount must be a number',
  EMPTY_NAME: 'Name field cannot be empty.',
  EMPTY_ASSIGNED_BY: 'Assigned by field cannot be empty.',
  EMPTY_CATEGORY_COURSE_ID: 'Category Product ID field cannot be empty.',
  INVALID_DURATION: 'Duration must be a number greater than 0.',
  INVALID_PRICE: 'Price must be a number greater than 0.',
  INVALID_DATE: 'End date must be later than start date.',
  INVALID_ASSIGNED_BY: 'Assigned by field must be a valid number.',
  FILE_TOO_LARGE: 'File size exceeds the limit of 5MB.'
}

router.put('/:id', (req, res, next) => {
  upload.single('locationPath')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: MESSAGES4.FILE_TOO_LARGE });
      }
      return res.status(500).json({ message: MESSAGES4.INTERNAL_SERVER_ERROR });
    } else if (err) {
      return res.status(500).json({ message: MESSAGES4.INTERNAL_SERVER_ERROR });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      assignedBy,
      Inventory_quantity,
      startDate,
      endDate,
      description,
      price,
      categoryCourseId,
      publicStatus,
      publicDate, 
      Discount
    } = req.body;
    const file = req.file;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: MESSAGES4.EMPTY_NAME });
    }
    if (!assignedBy) {
      return res.status(400).json({ message: MESSAGES4.EMPTY_ASSIGNED_BY });
    }
    if (!categoryCourseId) {
      return res.status(400).json({ message: MESSAGES4.EMPTY_CATEGORY_COURSE_ID });
    }

    // Validate assignedBy
    if (isNaN(assignedBy)) {
      return res.status(400).json({ message: MESSAGES4.INVALID_INPUT_ASSIGNEDBY });
    }
    if (Number(assignedBy) <= 0) {
      return res.status(400).json({ message: MESSAGES4.INVALID_ASSIGNED_BY });
    }

    // Validate price
    if (isNaN(price)) {
      return res.status(400).json({ message: MESSAGES4.INVALID_INPUT_PRICE });
    }
    if (Number(price) <= 0) {
      return res.status(400).json({ message: MESSAGES4.INVALID_PRICE });
    }

    // Validate end date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: MESSAGES4.INVALID_DATE });
    }

    // Find the Product
    const course = await models.Product.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: MESSAGES4.COURSE_NOT_FOUND });
    }

    // Check for duplicate course name
    const existingCourse = await models.Product.findOne({ where: { name, id: { [Op.ne]: id } } });
    if (existingCourse) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete the temporary file
      }
      return res.status(400).json({ message: MESSAGES4.DUPLICATE_COURSE_NAME });
    }

    // Remove old image if a new file is uploaded
    if (course.locationPath && file) {
      const oldFilePath = path.resolve(finalDir, course.locationPath);
      try {
        fs.unlinkSync(oldFilePath);
        console.log(`Deleted old image: ${oldFilePath}`);
      } catch (err) {
        console.error(`Error deleting old image: ${oldFilePath}`, err);
      }
    }

    const locationPath = file ? file.filename : course.locationPath; // Use existing path if no new file

    // Update course information
    course.name = name;
    course.assignedBy = assignedBy;
    course.Inventory_quantity = Inventory_quantity;
    course.description = description;
    course.price = price;
    course.categoryCourseId = categoryCourseId;
    course.locationPath = locationPath;
    course.publicStatus = publicStatus;
    course.publicDate = publicDate;
    course.Discount = Discount;
    await course.save();

    if (file) {
      const finalPath = path.join(finalDir, file.filename);
      fs.renameSync(file.path, finalPath); // Move file to final destination
    }

    res.json(course);
  } catch (error) {
    console.error('Error updating Product:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Delete the temporary file
    }
    res.status(500).json({ message: MESSAGES4.INTERNAL_SERVER_ERROR });
  }
});


// Route để tạo mới một sp
const tempDir = path.resolve(__dirname, '../../client/public/assets/images/uploads/product')
const finalDir = path.resolve(__dirname, '../../client/public/assets/images/uploads/product')

// Ensure the temporary directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir) // Store file temporarily
  },
  filename: function (req, file, cb) {
    cb(null, 'course_' + Date.now() + path.extname(file.originalname)) // Set file name
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file ảnh size to 5MB 5 * 1024 * 1024
})

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds the limit of 5MB' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('File upload request received');

    const {
      categoryCourseId,
      name,
      assignedBy,
      Discount,
      Inventory_quantity,
      description,
      price,
      publicStatus,
      status, // New field
      publicDate // New field
    } = req.body;

    if (!categoryCourseId) {
      return res.status(400).json({ message: MESSAGES.BAD_REQUEST_CATEGORY_COURSE_ID });
    }
    if (!name) {
      return res.status(400).json({ message: MESSAGES.BAD_REQUEST_NAME });
    }

    const existingCourse = await models.Product.findOne({ where: { name } });
    if (existingCourse) {
      if (req.file) {
        fs.unlinkSync(req.file.path); // Delete the temporary file
      }
      return res.status(409).json({ message: MESSAGES.CONFLICT_NAME_EXISTS });
    }

    const locationPath = req.file ? req.file.filename : null;

    const course = await models.Product.create({
      categoryCourseId,
      name,
      assignedBy,
      Discount,
      description,
      locationPath, // Store the filename of the uploaded file
      price,
      status,
      publicStatus, // Save the new field
      publicDate,
      Inventory_quantity, // Save the new field
      // number_star: 0 // Set number_star to 0
    });

    if (req.file) {
      const finalPath = path.join(finalDir, req.file.filename);
      fs.renameSync(req.file.path, finalPath); // Move file to final destination
    }

    res.json(course);
  } catch (error) {
    console.error('Error uploading file:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Delete the temporary file
    }
    res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

const dir = path.resolve(__dirname, '../../client/public/assets/images/uploads/product') // Sử dụng đường dẫn tuyệt đối
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
  console.log('Directory created:', dir)
} else {
  console.log('Directory already exists:', dir)
}
console.log('Absolute path:', dir)
router.get('/course-category', async (req, res) => {
  console.log()
  try {
    const courseCategory = await getCourseCategory()
    // logInfo(req, courseCategory)
    res.json(courseCategory)
  } catch (error) {
    // logError(req, error)
    res.status(500).json(error)
  }
})
// router.get('/getimage/:filename', (req, res) => {
//   const filename = req.params.filename
//   const filepath = path.join(__dirname, '../uploads', filename)
//   console.log(filepath)
//   res.sendFile(filepath)
// })
//tìm kiếm bằng price như bình thường

router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      minPrice, // Remove default value to handle special cases
      maxPrice, // Remove default value to handle special cases
      category: categoryCondition
    } = req.query;

    // Get current date
    const currentDate = new Date();

    // Determine the price range condition
    let priceCondition;
    if (minPrice && maxPrice) {
      priceCondition = { [Op.between]: [Number(minPrice), Number(maxPrice)] }; // Both min and max provided
    } else if (minPrice) {
      priceCondition = { [Op.between]: [1, Number(minPrice)] }; // Only minPrice provided, from 1 to minPrice
    } else if (maxPrice) {
      priceCondition = { [Op.between]: [Number(maxPrice), 99999] }; // Only maxPrice provided, up to maxPrice
    } else {
      priceCondition = { [Op.between]: [1, 999999] }; // Default high range if no price is specified
    }

    // Fetch filtered courses
    const listCourses = await models.Product.findAll({
      where: {
        publicStatus: {
          [Op.in]: [1, 2] // 1,2 are set to visible, 0 hides the product
        },
        publicDate: {
          [Op.lt]: currentDate
        },
        price: priceCondition, // Apply dynamic price range filter
        status: 1, // Only show products with status = 1
        Inventory_quantity: {           
          [Op.gt]: 0 // Inventory quantity greater than 0         
        }   
      },
      include: [
        {
          model: models.CategoryCourse,
          where: {
            status: 1 // Only include products where the category has status = 1
          },
          required: true // Ensures the product must have a valid category to be included
        }
      ],
      order: [['id', 'DESC']] // Order by latest courses
    });

    const coursePromises = listCourses.map(async (course) => {
      return {
        id: course.id,
        name: course.name,
        summary: course.summary,
        Discount: course.Discount,
        startDate: course.startDate,
        endDate: course.endDate,
        locationPath: course.locationPath,
        description: course.description,
        price: course.price,
        categoryCoursename: course.CategoryProduct ? course.CategoryProduct.name : null
      };
    });

    const dataFromDatabase = await Promise.all(coursePromises);

    // Apply search filtering
    const dataAfterNameSearch = applyNameSearch(searchCondition, dataFromDatabase);
    const dataAfterSearch = applyCourseCategoryNameSearch(categoryCondition, dataAfterNameSearch);

    // Paginate results
    const dataOfCurrentWindow = getDataInWindowSize(size, page, dataAfterSearch);

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    });
  } catch (error) {
    console.error(error); // Replace with logError(req, error) if you have a logging mechanism
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});


function applyNameSearch(searchCondition, data) {
  if (!searchCondition) return data;
  return data.filter(course =>
    course.name.toLowerCase().includes(searchCondition.toLowerCase())
  );
}

function applyCourseCategoryNameSearch(categoryCondition, data) {
  if (!categoryCondition || categoryCondition === 'all') return data;
  
  return data.filter(course => {
    const categoryCoursename = course.categoryCoursename;
    // Check if categoryCoursename is a valid string before applying toLowerCase()
    return categoryCoursename && typeof categoryCoursename === 'string' 
      ? categoryCoursename.toLowerCase().includes(categoryCondition.toLowerCase())
      : false;
  });
}


function getDataInWindowSize(size, page, data) {
  const pageSize = Number(size);
  const pageNumber = Number(page);
  const startIndex = (pageNumber - 1) * pageSize;
  return data.slice(startIndex, startIndex + pageSize);
}



module.exports = router
