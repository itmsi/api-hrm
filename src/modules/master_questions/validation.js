const { body, param } = require('express-validator')

const optionalString = (field, label) =>
  body(field).optional({ nullable: true }).isString().withMessage(`${label} harus berupa teks`).trim()

const createValidation = [
  optionalString('question_id', 'question_id'),
  optionalString('question_en', 'question_en'),
  optionalString('question_cn', 'question_cn'),
  optionalString('focus_assessment', 'focus_assessment')
    .isLength({ max: 255 })
    .withMessage('focus_assessment maksimal 255 karakter'),
  optionalString('step', 'step')
    .isLength({ max: 255 })
    .withMessage('step maksimal 255 karakter')
]

const updateValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid'),
  ...createValidation
]

const getByIdValidation = [
  param('id').notEmpty().withMessage('ID wajib diisi').isUUID().withMessage('Format ID tidak valid')
]

const getListValidation = [
  body('page').optional().isInt({ min: 1 }).withMessage('Page harus berupa angka positif'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100'),
  body('search').optional({ nullable: true }).isString().withMessage('Search harus berupa teks'),
  body('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'focus_assessment', 'step'])
    .withMessage('sort_by harus salah satu dari created_at, updated_at, focus_assessment, step'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
}
