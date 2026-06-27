const { body, param } = require('express-validator')

const SORT_COLUMNS = [
  'created_at',
  'candidate_name',
  'candidate_email',
  'candidate_number'
]

const createValidation = [
  body('company_id').optional().isUUID().withMessage('company_id harus UUID'),
  body('department_id').optional().isUUID().withMessage('department_id harus UUID'),
  body('title_id').optional().isUUID().withMessage('title_id harus UUID'),
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
  body('sort_order').optional().isIn(['asc', 'desc']).withMessage('sort_order harus asc atau desc')
]

module.exports = {
  createValidation,
  updateValidation,
  getByIdValidation,
  getListValidation
}
