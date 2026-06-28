const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'candidates'
const SELECT_COLUMNS = [
  'candidate_id',
  'company_id',
  'department_id',
  'title_id',
  'candidate_number',
  'candidate_name',
  'candidate_email',
  'candidate_phone',
  'candidate_religion',
  'candidate_gender',
  'candidate_marital_status',
  'candidate_age',
  'candidate_date_birth',
  'candidate_nationality',
  'candidate_city',
  'candidate_state',
  'candidate_country',
  'candidate_address',
  'candidate_foto',
  'candidate_resume',
  'candidate_foto_path',
  'candidate_resume_path',
  'ptk_date',
  'offering_letter',
  'remark',
  'schedule_interview',
  'group_id',
  'candidate_status',
  'candidate_status_offering_letter',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const ALLOWED_SORT_COLUMNS = [
  'created_at',
  'candidate_name',
  'candidate_email',
  'candidate_number'
]
const SEARCHABLE_COLUMNS = [
  'candidate_name',
  'candidate_email',
  'candidate_number'
]
const ALLOWED_FILTER_COLUMNS = [
  'group_id',
  'company_id',
  'department_id',
  'title_id',
  'candidate_status',
  'candidate_status_offering_letter',
  'assign_role'
]

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

  const assignRoleFilter = queryParams.filters.assign_role
  if (assignRoleFilter !== undefined) {
    delete queryParams.filters.assign_role
  }

  const baseQuery = pgCore(TABLE_NAME).select(SELECT_COLUMNS).where({ deleted_at: null })
  const filteredQuery = applyStandardFilters(baseQuery, queryParams)

  let query = filteredQuery
  if (assignRoleFilter) {
    query = query.whereRaw("schedule_interview->>'assign_role' ILIKE ?", [`%${assignRoleFilter}%`])
  }

  const data = await query
  let totalQuery = buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('candidate_id as count')
    .first()

  if (assignRoleFilter) {
    totalQuery = totalQuery.whereRaw("schedule_interview->>'assign_role' ILIKE ?", [`%${assignRoleFilter}%`])
  }

  const totalResult = await totalQuery

  const total = parseInt(totalResult?.count || 0, 10)
  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ candidate_id: id, deleted_at: null })
    .first()
}

const create = async (data) => {
  const payload = {
    ...data,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false
  }

  const [result] = await pgCore(TABLE_NAME).insert(payload).returning(SELECT_COLUMNS)
  return result
}

const update = async (id, data) => {
  const payload = {
    ...data,
    updated_at: pgCore.fn.now()
  }

  const [result] = await pgCore(TABLE_NAME)
    .where({ candidate_id: id, deleted_at: null })
    .update(payload)
    .returning(SELECT_COLUMNS)
  return result
}

const remove = async (id, deletedBy) => {
  const [result] = await pgCore(TABLE_NAME)
    .where({ candidate_id: id, deleted_at: null })
    .update({
      deleted_at: pgCore.fn.now(),
      deleted_by: deletedBy,
      updated_at: pgCore.fn.now(),
      is_delete: true
    })
    .returning(SELECT_COLUMNS)
  return result
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
