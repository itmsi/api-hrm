const express = require('express')
const router = express.Router()
const controller = require('./controller')
const {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation,
  normalizeCandidateFormData
} = require('./validation')
const { verifyToken } = require('../../middlewares')
const { validateMiddleware } = require('../../middlewares/validation')
const { handleCandidateFileUpload, handleFileUpload } = require('../../middlewares/fileUpload')

/**
 * @route   POST /api/hrm/candidates/get
 * @desc    Get candidates with pagination, search, and sort
 * @access  Protected
 */
router.post(
  '/get',
  verifyToken,
  getListValidation,
  validateMiddleware,
  controller.getList
)

/**
 * @route   POST /api/hrm/candidates/create
 * @desc    Create a new candidate
 * @access  Protected
 */
router.post(
  '/create',
  verifyToken,
  handleCandidateFileUpload,
  normalizeCandidateFormData,
  createValidation,
  validateMiddleware,
  controller.create
)

/**
 * @route   POST /api/hrm/candidates/import
 * @desc    Import candidates from a CSV file
 * @access  Public
 */
router.post(
  '/import',
  handleFileUpload,
  controller.importCsv
)

/**
 * @route   PUT /api/hrm/candidates/:id
 * @desc    Update candidate by ID
 * @access  Protected
 */
router.put(
  '/:id',
  verifyToken,
  handleCandidateFileUpload,
  normalizeCandidateFormData,
  updateValidation,
  validateMiddleware,
  controller.update
)

/**
 * @route   DELETE /api/hrm/candidates/:id
 * @desc    Soft delete candidate by ID
 * @access  Protected
 */
router.delete(
  '/:id',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.remove
)

/**
 * @route   GET /api/hrm/candidates/:id
 * @desc    Get candidate by ID
 * @access  Protected
 */
router.get(
  '/:id',
  verifyToken,
  getByIdValidation,
  validateMiddleware,
  controller.getById
)

module.exports = router
