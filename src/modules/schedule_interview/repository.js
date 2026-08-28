const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'schedule_interviews'
const SELECT_COLUMNS = [
  'schedule_interview_id',
  'candidate_id',
  'assign_role',
  'schedule_interview_date',
  'schedule_interview_time',
  'schedule_interview_duration',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete',
  'created_employee.employee_name as created_by_name',
  'updated_employee.employee_name as updated_by_name'
]
const ALLOWED_SORT_COLUMNS = ['created_at', 'schedule_interview_date', 'schedule_interview_time']
const SEARCHABLE_COLUMNS = ['schedule_interview_duration']
const ALLOWED_FILTER_COLUMNS = ['candidate_id']

const normalizeFilterValue = (value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return value
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return undefined
  return value
}

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ['created_at', 'desc'],
      searchableColumns: SEARCHABLE_COLUMNS,
      allowedFilters: ALLOWED_FILTER_COLUMNS,
      fromBody: true
    }
  )

  Object.keys(queryParams.filters).forEach((key) => {
    queryParams.filters[key] = normalizeFilterValue(queryParams.filters[key])
  })

  const baseQuery = pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${TABLE_NAME}.updated_by`)
    .where({ deleted_at: null })

  const filteredQuery = applyStandardFilters(baseQuery, queryParams)
  const data = await filteredQuery

  let totalQuery = buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('schedule_interview_id as count')
    .first()

  const totalResult = await totalQuery
  const total = parseInt(totalResult?.count || 0, 10)

  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${TABLE_NAME}.updated_by`)
    .where({ schedule_interview_id: id, deleted_at: null })
    .first()
}

const create = async (data) => {
  const payload = {
    ...data,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false
  }

  const [inserted] = await pgCore(TABLE_NAME).insert(payload).returning('schedule_interview_id')
  return await findById(inserted.schedule_interview_id)
}

const update = async (id, data) => {
  const payload = {
    ...data,
    updated_at: pgCore.fn.now()
  }

  const [updated] = await pgCore(TABLE_NAME)
    .where({ schedule_interview_id: id, deleted_at: null })
    .update(payload)
    .returning('schedule_interview_id')

  if (!updated?.schedule_interview_id) return null
  return await findById(updated.schedule_interview_id)
}

const remove = async (id, deletedBy) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ schedule_interview_id: id, deleted_at: null })
    .update({
      deleted_at: pgCore.fn.now(),
      deleted_by: deletedBy,
      updated_at: pgCore.fn.now(),
      is_delete: true
    })
    .returning('schedule_interview_id')

  if (!updated?.schedule_interview_id) return null

  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${TABLE_NAME}.updated_by`)
    .where({ schedule_interview_id: updated.schedule_interview_id })
    .first()
}

const findRawById = async (id) => {
  return pgCore(TABLE_NAME).where({ schedule_interview_id: id }).first()
}

const insertRaw = async (payload) => {
  const [inserted] = await pgCore(TABLE_NAME).insert(payload).returning('schedule_interview_id')
  return inserted
}

const updateRaw = async (id, payload) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ schedule_interview_id: id })
    .update(payload)
    .returning('schedule_interview_id')
  return updated
}

const findEmployeeIdByName = async (employeeName) => {
  return pgCore('gate_sso_employees')
    .whereRaw('lower(employee_name) = ?', [String(employeeName).trim().toLowerCase()])
    .first()
}

const findAllByCandidateId = async (candidateId) => {
  return pgCore(TABLE_NAME)
    .select('assign_role', 'schedule_interview_date', 'schedule_interview_time', 'schedule_interview_duration')
    .where({ candidate_id: candidateId, deleted_at: null })
    .orderByRaw("COALESCE(schedule_interview_date::text, '') DESC")
    .orderByRaw("COALESCE(schedule_interview_time::text, '') DESC")
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findAllByCandidateId,
  findRawById,
  insertRaw,
  updateRaw,
  findEmployeeIdByName
}
