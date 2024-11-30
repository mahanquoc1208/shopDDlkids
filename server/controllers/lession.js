const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()

router.get('/:lessionId', isAuthenticated, async (req, res) => {
  const { lessionId } = req.params

  try {
    const lessionCate = await models.CategoryLession.findAll()
    const lession = await models.Lession.findByPk(lessionId)

    const response = {
      ...lession.toJSON(), // Chuyển đổi course thành object
      categoryLessionName: lessionCate?.find((e) => lession.lessionCategoryId === e.id)?.name ?? null
    }
    res.json(response)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
