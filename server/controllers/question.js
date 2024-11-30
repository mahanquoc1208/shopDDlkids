/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable brace-style */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const sequelize = require('../models/init')
const router = express.Router()

router.get('/:id', async (req, res) => {
  try {
    const requestedQuestionId = req.params.id
    const fieldList = 'QD.comment, QD.like, QD.unlike, QD.updatedAt, U.firstName, U.lastName, U.username'
    const joinCondition = 'QD.userId = U.id'
    const whereCondition = ' WHERE QD.questionId = ' + requestedQuestionId
    const order = ' ORDER BY updatedAt DESC'
    const [results] = await sequelize.query(
      'SELECT ' + fieldList + ' FROM question_discussion QD JOIN users U ON ' + joinCondition + whereCondition + order
    )
    res.json(results)
  } catch (error) {
    res.json(error)
  }
})

router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    // const requestedExamId = req.params.id
    const loginedUserId = req.user.id
    const requestedQuestionId = req.params.id
    if (req.body.data) {
      const discussion = [{
        userId: loginedUserId,
        examId: req.body.data.examId,
        questionId: requestedQuestionId,
        comment: req.body.data.comment
      }]
      const response = await models.QuestionDiscussion.bulkCreate(discussion)
      res.json({
        response
      })
    } else {
      res.status(400)
    }
  } catch (error) {
    res.json(error)
  }
})

module.exports = router
