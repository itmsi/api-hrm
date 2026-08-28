const express = require('express')
const router = express.Router()
const controller = require('./controller')
const {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation,
  normalizeScheduleInterviewFormData
} = require('./validation')
const { verifyToken } = require('../../middlewares')
const { validateMiddleware } = require('../../middlewares/validation')
const { handleFileUpload } = require('../../middlewares/fileUpload')

router.post(
  '/get',
  verifyToken,
  getListValidation,
  validateMiddleware,
  controller.getList
)

router.post(
  '/create',
  verifyToken,
  normalizeScheduleInterviewFormData,
  createValidation,
  validateMiddleware,
  controller.create
)

router.post(
  '/import',
  handleFileUpload,
  controller.importCsv
)

router.put(
  '/:id',
  verifyToken,
  normalizeScheduleInterviewFormData,
  updateValidation,
  validateMiddleware,
  controller.update
)

router.delete(
  '/:id',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.remove
)

router.get(
  '/:id',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.getById
)

module.exports = router
