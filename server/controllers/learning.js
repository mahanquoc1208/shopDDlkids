const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error: error.message,
    user: req.user.id
  })
}

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

router.get('/getCategoryLessionsByCourse/:courseId', isAuthenticated, async (req, res) => {
  const { courseId } = req.params

  try {
    const categoryLessions = await models.CategoryLession.findAll({
      where: {
        courseId
      }
    })
    logInfo(req, categoryLessions)
    res.json(categoryLessions)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})

router.get('/getLessionByCategory/:lessionCategoryId', isAuthenticated, async (req, res) => {
  const { lessionCategoryId } = req.params

  try {
    const lessions = await models.Lession.findAll({
      where: {
        lessionCategoryId
      }
    })
    logInfo(req, lessions)
    res.json(lessions)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})

router.post('/addEnrollment', isAuthenticated, async (req, res) => {
  const loginedUserId = req.user.id
  const courseId = req.body.data

  try {
    const newEnrollment = await models.Enrollment.create({
      courseId,
      userId: loginedUserId,
      enrollment_date: new Date()
    })
    logInfo(req, newEnrollment)
    res.json(newEnrollment)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
router.get('/getEnrollmentByCourseId/:courseId', isAuthenticated, async (req, res) => {
  const loginedUserId = req.user.id
  const courseIdData = req.params.courseId
  try {
    console.log('courseId', courseIdData)
    const enrollment = await models.Enrollment.findOne({ where: { courseId: courseIdData, userId: loginedUserId } })
    logInfo(req, enrollment)
    res.json(enrollment)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
router.get('/getEnrollmentByUserId', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const enrollments = await models.Enrollment.findAll({ where: { userId: loginedUserId } })
    logInfo(req, enrollments)
    res.json(enrollments)
  } catch (err) {
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})

router.get('/getProgressByEnrollmentId/:enrollmentId', isAuthenticated, async (req, res) => {
  try {
    const enrollmentId = req.params.enrollmentId

    const courseProgress = await models.CourseProgress.findAll({ where: { enrollmentId } })
    logInfo(req, courseProgress)
    res.status(200).json({ data: courseProgress })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})

router.post('/addProgress', isAuthenticated, async (req, res) => {
  try {
    const { enrollmentId, lessionId } = req.body.data
    // Check if progress already exists
    const existingProgress = await models.CourseProgress.findOne({
      where: {
        enrollmentId,
        lessionId
      }
    })
    if (existingProgress) {
      console.log('Learn again')
      return res.status(400).json({ data: existingProgress })
    }
    const newProgress = await models.CourseProgress.create({
      enrollmentId,
      lessionId,
      completion_at: null
    })
    logInfo(req, newProgress)
    res.status(200).json({ data: newProgress })
  } catch (error) {
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
