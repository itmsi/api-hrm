const { body, param } = require('express-validator')

const isUuidOrEmpty = (value) => {
  if (value === undefined || value === null) return true
  if (typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return true
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

const SORT_COLUMNS = [
  'created_at',
  'candidate_name',
  'candidate_email',
  'candidate_number'
]

const normalizeCandidateFormValue = (key, value) => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return undefined

  if (key === 'candidate_age' && /^\d+$/.test(trimmed)) {
    return Number(trimmed)
  }

  if (key === 'is_delete') {
    const normalized = trimmed.toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }

  if (key === 'schedule_interview') {
    try {
      return JSON.parse(trimmed)
    } catch (error) {
      return value
    }
  }

  return value
}

const normalizeCandidateFormData = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return next()
  }

  const normalizedBody = {}
  Object.keys(req.body).forEach((key) => {
    normalizedBody[key] = normalizeCandidateFormValue(key, req.body[key])
  })

  if (!req.files?.candidate_foto) {
    delete normalizedBody.candidate_foto
  }

  if (!req.files?.candidate_resume) {
    delete normalizedBody.candidate_resume
  }

  req.body = normalizedBody
  return next()
}

const createValidation = [
  body('company_id').optional().isUUID().withMessage('company_id harus UUID'),
  body('department_id').optional().isUUID().withMessage('department_id harus UUID'),
  body('title_id').optional().isUUID().withMessage('title_id harus UUID'),
  body('group_id').optional().isUUID().withMessage('group_id harus UUID'),
  body('candidate_status').optional().isString().isLength({ max: 255 }).withMessage('candidate_status harus teks maksimal 255 karakter').trim(),
  body('candidate_email').optional().isEmail().withMessage('Format email tidak valid').trim(),
  body('candidate_phone').optional().isString().withMessage('candidate_phone harus berupa teks').trim(),
  body('candidate_date_birth').optional().isDate().withMessage('candidate_date_birth harus berupa tanggal'),
  body('candidate_age').optional().isInt({ min: 0 }).withMessage('candidate_age harus angka positif'),
  body('candidate_gender').optional().isString().withMessage('candidate_gender harus berupa teks').trim(),
  body('candidate_marital_status').optional().isString().withMessage('candidate_marital_status harus berupa teks').trim(),
  body('candidate_number').optional().isString().withMessage('candidate_number harus berupa teks').trim(),
  body('candidate_name').optional().isString().withMessage('candidate_name harus berupa teks').trim(),
  body('candidate_religion').optional().isString().withMessage('candidate_religion harus berupa teks').trim(),
  body('candidate_nationality').optional().isString().withMessage('candidate_nationality harus berupa teks').trim(),
  body('candidate_city').optional().isString().withMessage('candidate_city harus berupa teks').trim(),
  body('candidate_state').optional().isString().withMessage('candidate_state harus berupa teks').trim(),
  body('candidate_country').optional().isString().withMessage('candidate_country harus berupa teks').trim(),
  body('candidate_address').optional().isString().withMessage('candidate_address harus berupa teks').trim(),
  body('candidate_foto').optional().isString().withMessage('candidate_foto harus berupa teks').trim(),
  body('candidate_resume').optional().isString().withMessage('candidate_resume harus berupa teks').trim(),
  body('candidate_foto_is_delete').optional().isBoolean().withMessage('candidate_foto_is_delete harus boolean'),
  body('candidate_resume_is_delete').optional().isBoolean().withMessage('candidate_resume_is_delete harus boolean'),
  body('schedule_interview').optional().isObject().withMessage('schedule_interview harus berupa object'),
  body('schedule_interview.assign_role').optional().isString().withMessage('assign_role harus berupa teks').trim(),
  body('schedule_interview.schedule_interview_date').optional().isDate().withMessage('schedule_interview_date harus berupa tanggal'),
  body('schedule_interview.schedule_interview_time').optional().isString().withMessage('schedule_interview_time harus berupa teks').trim(),
  body('schedule_interview.schedule_interview_duration').optional().isString().withMessage('schedule_interview_duration harus berupa teks').trim(),
  body('ptk_date').optional().isDate().withMessage('ptk_date harus berupa tanggal'),
  body('offering_letter').optional().isDate().withMessage('offering_letter harus berupa tanggal'),
  body('remark').optional().isString().withMessage('remark harus berupa teks').trim(),
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
  body('sort_by').optional().isIn(SORT_COLUMNS).withMessage(`sort_by harus salah satu dari: ${SORT_COLUMNS.join(', ')}`),
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc'),
  body('group_id').optional().custom(isUuidOrEmpty).withMessage('group_id harus UUID atau kosong'),
  body('company_id').optional().custom(isUuidOrEmpty).withMessage('company_id harus UUID atau kosong'),
  body('department_id').optional().custom(isUuidOrEmpty).withMessage('department_id harus UUID atau kosong'),
  body('title_id').optional().custom(isUuidOrEmpty).withMessage('title_id harus UUID atau kosong'),
  body('candidate_status').optional().isString().withMessage('candidate_status harus berupa teks').trim(),
  body('candidate_status_offering_letter').optional({ nullable: true }).isString().withMessage('candidate_status_offering_letter harus berupa teks atau null').trim(),
  body('assign_role').optional().isString().withMessage('assign_role harus berupa teks').trim()
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation,
  normalizeCandidateFormData
}
