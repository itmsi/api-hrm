const { body, param } = require('express-validator')

const isUuidOrEmpty = (value) => {
  if (value === undefined || value === null) return true
  if (typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return true
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

const createValidation = [
  body('candidate_id').optional().custom(isUuidOrEmpty).withMessage('candidate_id harus UUID atau kosong'),
  body('notes').optional().isString().withMessage('notes harus berupa teks').trim(),
  body('is_delete').optional().isBoolean().withMessage('is_delete harus boolean')
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
  body('search').optional().isString().withMessage('Search harus berupa teks'),
  body('sort_by').optional().isIn(['created_at']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('candidate_id').optional().custom(isUuidOrEmpty).withMessage('candidate_id harus UUID atau kosong')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
}
