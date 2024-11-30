const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const Sequelize = require('sequelize')
const { hasOverAttempt, checkIfCorrect, getScore, getMaxExamScore } = require('../logic/exam')

const router = express.Router()

router.get('/:id/getShortHistory', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id
    const userExamHistory = await models.UserAnswerHistory.findAll({
      attributes: ['examId', 'attempt', 'overAllScore', [Sequelize.fn('max', Sequelize.col('updatedAt')), 'updatedAt'], [Sequelize.fn('COUNT', 'attempt'), 'numberOfQuestions']],
      where: {
        examId: requestedExamId,
        userId: loginedUserId
      },
      group: ['attempt', 'overAllScore']
    })
    const examInfo = await models.Exam.findOne({
      attributes: ['name'],
      where: {
        id: requestedExamId
      }
    })
    const resInfo = userExamHistory.map((item, index) => {
      return {
        ...item.dataValues,
        name: examInfo.dataValues.name
      }
    })
    res.json(resInfo)
  } catch (error) {
    res.json(error)
  }
})

router.post('/:id/saveTemporaryAnswer', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id
    await models.TempUserAnswer.destroy({
      where: {
        examId: requestedExamId,
        userId: loginedUserId
      }
    })
    if (req.body.data) {
      const data = []
      for (const [key, value] of Object.entries(req.body.data)) {
        const item = {
          userId: loginedUserId,
          examId: requestedExamId,
          questionId: key,
          userAnswer: value
        }
        data.push(item)
      }
      const response = await models.TempUserAnswer.bulkCreate(data)
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

router.get('/:id/:attempt?', isAuthenticated, async (req, res) => {
  try {
    const requestedExamId = req.params.id
    const loginedUserId = req.user.id
    const requestedStatus = req.query.status

    console.log('>>> log params', requestedExamId, loginedUserId, requestedStatus)

    const { listQuestionsWithDetailOfExam, examInfo } = await getExamInfoWithDetails(requestedExamId)
    const lastAttempt = await getLastUserAttemptById(loginedUserId, requestedExamId)
    const requestedAttempt = req.params.attempt ? req.params.attempt : lastAttempt
    const { lastAtemptUserAnswer, lastExamRoomRecord } = await getUserAnswerHistory(loginedUserId, requestedExamId, requestedAttempt)
    const lastUpdatedExamRoomRecord = await doEnterRoomProcedure(lastExamRoomRecord, loginedUserId, requestedExamId, requestedStatus)
    const tempUserAnswer = await getTempUserAnswer(loginedUserId, requestedExamId)
    const result = listQuestionsWithDetailOfExam.map((questionData) => {
      const userQuestionData = lastAtemptUserAnswer?.find(
        (data) => data.questionId === questionData.id
      )
      let explanation = null
      let correctAnswer = null
      let isCorrect = null
      let userAnswer = null
      let score = null
      if (userQuestionData?.attempt && requestedStatus === 'view') {
        explanation = questionData.explanation
        correctAnswer = questionData.answer
        isCorrect = userQuestionData?.isCorrect
        userAnswer = userQuestionData?.userAnswer
        score = userQuestionData?.score
      }
      const tempUserAnswerData = tempUserAnswer?.find(
        (data) => data.questionId === questionData.id
      )
      if (requestedStatus === 'test') {
        userAnswer = tempUserAnswerData?.userAnswer
      }
      return {
        id: questionData.id,
        title: questionData.content,
        type: questionData.type,
        a: questionData.a,
        b: questionData.b,
        c: questionData.c,
        d: questionData.d,
        e: questionData.e,
        f: questionData.f,
        g: questionData.g,
        h: questionData.h,
        i: questionData.i,
        j: questionData.j,
        k: questionData.k,
        l: questionData.l,
        m: questionData.m,
        n: questionData.n,
        o: questionData.o,
        p: questionData.p,
        userAnswer,
        isCorrect,
        explanation,
        score,
        correctAnswer
      }
    })

    res.json({
      id: examInfo.id,
      name: examInfo.name,
      description: examInfo.description,
      numberOfAttempt: examInfo.numberOfAttempt,
      durationInMinute: examInfo.durationInMinute,
      attempted: requestedAttempt,
      lastAttempted: lastAttempt,
      score: lastAtemptUserAnswer?.[0]?.overAllScore,
      enterTime: lastUpdatedExamRoomRecord?.enterTime,
      exitTime: lastUpdatedExamRoomRecord?.exitTime || null,
      questions: result
    })
  } catch (error) {
    res.json({ error })
  }
})

router.post('/:id', isAuthenticated, async (req, res) => {
  try {
    const loginedUserId = req.user.id
    const requestedExamId = req.params.id
    const examInfo = await getExamById(req.params.id)
    const lastAttempt = await getLastAttemptedRecord(loginedUserId, requestedExamId)
    if (hasOverAttempt(examInfo.numberOfAttempt, lastAttempt?.attempt)) {
      throw String('too many attempted!')
    }
    const lastExamRoomRecord = await getLastExamRoomRecord(loginedUserId, requestedExamId)
    if (lastExamRoomRecord == null) {
      throw String('something wrong')
    }
    await doExitRoomProcedure(lastExamRoomRecord)

    const questionsDictionary = {}
    const listQuestionIds = Object.keys(req.body.data)
    const listQuestions = await getAllQuestionInList(listQuestionIds)
    listQuestions.forEach((questionData) => {
      questionsDictionary[questionData.id] = questionData
    })

    const maxExamScore = getMaxExamScore(listQuestions?.length)
    let scoreAcquired = 0
    let data = listQuestionIds.map((index) => {
      const isThisAnswerCorrect = checkIfCorrect(
        questionsDictionary[index]?.type,
        req.body.data[index],
        questionsDictionary[index]?.answer
      )
      const questionScore = getScore(isThisAnswerCorrect)
      scoreAcquired += questionScore
      return {
        userId: req.user.id,
        examId: req.params.id,
        questionId: index,
        userAnswer: req.body.data[index],
        isCorrect: isThisAnswerCorrect,
        score: questionScore
      }
    })
    const lastUpDatedExamRoomRecord = await getLastExamRoomRecord(loginedUserId, requestedExamId)
    const roomEnterTime = new Date(lastUpDatedExamRoomRecord.enterTime)
    const roomExitTime = new Date(lastUpDatedExamRoomRecord.exitTime)
    const examDurationInMiliSecond = examInfo.durationInMinute * 60 * 1000
    if (examInfo.durationInMinute && examDurationInMiliSecond !== 0 && examDurationInMiliSecond < roomExitTime - roomEnterTime) {
      scoreAcquired = 0
    }
    const overAllScore = `${scoreAcquired} / ${maxExamScore}`
    data = data.map((d) => ({
      ...d,
      attempt: lastAttempt ? lastAttempt.attempt + 1 : 1,
      overAllScore
    }))

    const response = await models.UserAnswerHistory.bulkCreate(data)
    await models.TempUserAnswer.destroy({
      where: {
        examId: requestedExamId,
        userId: loginedUserId
      }
    })
    res.json({
      response
    })
  } catch (error) {
    res.json(error)
  }
})

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '10',
      search: searchCondition,
      examStatus = 'all'
    } = req.query
    const listExams = await models.Exam.findAll()
    const userAnwserHistory = await getUserAnswerByUserId(req.user.id)
    const dataFromDatabase = listExams?.map((exam) => ({
      id: exam.id,
      name: exam.name,
      description: exam.description,
      attempted:
        userAnwserHistory?.find((e) => exam.id === e.examId)?.attempt ?? null,
      numberOfAttempt: exam.numberOfAttempt,
      durationInMinute: exam.durationInMinute,
      // createdAt: exam.createdAt,
      // updatedAt: exam.updatedAt,
      score:
        userAnwserHistory?.find((e) => exam.id === e.examId)?.overAllScore ?? null
    }))
    const dataAfterNameSearch = applyNameSearch(
      searchCondition,
      dataFromDatabase
    )
    const dataAfterNameAndStatusSearch = applyStatusSearch(
      examStatus,
      dataAfterNameSearch
    )
    const dataOfCurrentWindow = getDataInWindowSize(
      size,
      page,
      dataAfterNameAndStatusSearch
    )

    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterNameAndStatusSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    res.json(error)
  }
})

module.exports = router

async function getUserAnswerHistory (loginedUserId, requestedExamId, attempt) {
  const lastExamRoomRecord = await getLastExamRoomRecord(
    loginedUserId,
    requestedExamId
  )

  let lastAtemptUserAnswer = null
  if (attempt) {
    lastAtemptUserAnswer = await getAttemptUserAnswerHistoryById(
      loginedUserId,
      requestedExamId,
      attempt
    )
  }
  return { lastAtemptUserAnswer, lastExamRoomRecord }
}

async function getExamInfoWithDetails (requestedExamId) {
  const examInfo = await getExamById(requestedExamId)
  const listQuestionsOfExam = await getExamQuestionsById(requestedExamId)

  const listQuestionsWithDetailOfExam = await models.Question.findAll({
    where: {
      id: listQuestionsOfExam?.map((data) => data.questionId)
    }
  })
  return { listQuestionsWithDetailOfExam, examInfo }
}

function applyStatusSearch (examStatus, inputData) {
  let filteredData = inputData
  if (examStatus === 'done') {
    filteredData = inputData.filter((d) => !!d.score)
  } else if (examStatus === 'not-done') {
    filteredData = inputData.filter((d) => !d.score)
  }
  return filteredData
}

function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.name?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
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

async function getUserAnswerByUserId (userId) {
  return await models.UserAnswerHistory.findAll({
    where: { userId },
    order: [['id', 'DESC']]
  })
}

async function getAllQuestionInList (listQuestionIds) {
  return await models.Question.findAll({
    where: {
      id: {
        [Sequelize.Op.or]: listQuestionIds
      }
    }
  })
}

async function getLastAttemptedRecord (userId, examId) {
  return await models.UserAnswerHistory.findOne({
    where: {
      examId,
      userId // req.user.id,
    },
    order: [['id', 'DESC']]
  })
}

async function getExamById (examId) {
  return await models.Exam.findOne({
    where: {
      id: examId
    }
  })
}
async function getExamQuestionsById (examId) {
  return await models.ExamQuestion.findAll({
    where: {
      examId
    }
  })
}
async function getAttemptUserAnswerHistoryById (userId, examId, attempt) {
  return await models.UserAnswerHistory.findAll({
    where: {
      examId,
      userId,
      attempt
    },
    order: [['id', 'DESC']]
  })
}

async function getLastUserAttemptById (userId, examId) {
  const lastAttempt = await models.UserAnswerHistory.findOne({
    where: {
      examId,
      userId
    },
    order: [['id', 'DESC']]
  })
  return lastAttempt?.attempt
}

async function getLastExamRoomRecord (userId, examId) {
  return await models.UserEnterExitExamRoom.findOne({
    where: {
      examId,
      userId
    },
    order: [['id', 'DESC']]
  })
}

async function getTempUserAnswer (userId, examId) {
  return await models.TempUserAnswer.findAll({
    where: {
      examId,
      userId
    }
  })
}

async function doEnterRoomProcedure (examRoomRecord, loginedUserId, requestedExamId, requestedStatus) {
  if (requestedStatus === 'test') {
    if (examRoomRecord == null) {
      await models.UserEnterExitExamRoom.bulkCreate([{
        userId: loginedUserId,
        examId: requestedExamId,
        enterTime: Sequelize.fn('NOW'),
        attempt: 1
      }])
    } else if (examRoomRecord.enterTime != null && examRoomRecord.exitTime != null) {
      await models.UserEnterExitExamRoom.bulkCreate([{
        userId: loginedUserId,
        examId: requestedExamId,
        enterTime: Sequelize.fn('NOW'),
        attempt: examRoomRecord.attempt + 1
      }])
    }
  } else if (examRoomRecord == null) {
    await models.UserEnterExitExamRoom.bulkCreate([{
      userId: loginedUserId,
      examId: requestedExamId,
      enterTime: Sequelize.fn('NOW'),
      attempt: 1
    }])
  }
  return await getLastExamRoomRecord(loginedUserId, requestedExamId)
}

async function doExitRoomProcedure (lastExamRoomRecord) {
  lastExamRoomRecord.set({
    exitTime: Sequelize.fn('NOW')
  })
  await lastExamRoomRecord.save()
}
