const { body, param } = require('express-validator')

const isUuidOrEmpty = (value) => {
  if (value === undefined || value === null) return true
  if (typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return true
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

const normalizeScheduleInterviewFormValue = (key, value) => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return undefined

  if (key === 'assign_role') {
    try {
      return JSON.parse(trimmed)
    } catch (error) {
      return value
    }
  }

  return value
}

const normalizeScheduleInterviewFormData = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next()
  }

  const normalizedBody = {}
  Object.keys(req.body).forEach((key) => {
    normalizedBody[key] = normalizeScheduleInterviewFormValue(key, req.body[key])
  })

  req.body = normalizedBody
  return next()
}

const createValidation = [
  body('candidate_id').optional().custom(isUuidOrEmpty).withMessage('candidate_id harus UUID atau kosong'),
  body('assign_role').optional().isObject().withMessage('assign_role harus berupa object'),
  body('schedule_interview_date').optional().isDate().withMessage('schedule_interview_date harus berupa tanggal'),
  body('schedule_interview_time').optional().isString().withMessage('schedule_interview_time harus berupa teks').trim(),
  body('schedule_interview_duration').optional().isString().withMessage('schedule_interview_duration harus berupa teks').trim(),
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
  body('sort_by').optional().isIn(['created_at', 'schedule_interview_date', 'schedule_interview_time']).withMessage('sort_by tidak valid'),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('candidate_id').optional().custom(isUuidOrEmpty).withMessage('candidate_id harus UUID atau kosong')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation,
  normalizeScheduleInterviewFormData
}
