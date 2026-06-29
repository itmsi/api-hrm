const { body, param } = require('express-validator')

const isUuidOrEmpty = (value) => {
  if (value === undefined || value === null) return true
  if (typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return true
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

const normalizeInterviewFormValue = (key, value) => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return undefined

  return value
}

const normalizeInterviewFormData = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next()
  }

  const normalizedBody = {}
  Object.keys(req.body).forEach((key) => {
    normalizedBody[key] = normalizeInterviewFormValue(key, req.body[key])
  })

  req.body = normalizedBody
  return next()
}

const createValidation = [
  body('schedule_interview_id').optional().custom(isUuidOrEmpty).withMessage('schedule_interview_id harus UUID atau kosong'),
  body('assigned_id').optional().custom(isUuidOrEmpty).withMessage('assigned_id harus UUID atau kosong'),
  body('company_value').optional().isString().withMessage('company_value harus berupa teks').trim(),
  body('comment').optional().isString().withMessage('comment harus berupa teks').trim(),
  body('detail_interviews').optional().isArray().withMessage('detail_interviews harus berupa array'),
  body('detail_interviews.*.aspect').optional().isString().withMessage('detail_interviews[].aspect harus berupa teks').trim(),
  body('detail_interviews.*.question').optional().isString().withMessage('detail_interviews[].question harus berupa teks').trim(),
  body('detail_interviews.*.answer').optional().isString().withMessage('detail_interviews[].answer harus berupa teks').trim(),
  body('detail_interviews.*.score').optional().custom((value) => value === undefined || value === null || typeof value === 'number' || typeof value === 'string').withMessage('detail_interviews[].score harus berupa angka atau teks'),
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
  body('sort_by').optional().isIn(['created_at', 'company_value', 'comment']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('schedule_interview_id').optional().custom(isUuidOrEmpty).withMessage('schedule_interview_id harus UUID atau kosong')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation,
  normalizeInterviewFormData
}
