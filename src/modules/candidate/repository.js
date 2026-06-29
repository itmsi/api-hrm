const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'candidates'
const SELECT_COLUMNS = [
  'candidates.candidate_id',
  'candidates.company_id',
  'candidates.department_id',
  'candidates.title_id',
  'candidates.candidate_number',
  'candidates.candidate_name',
  'candidates.candidate_email',
  'candidates.candidate_phone',
  'candidates.candidate_religion',
  'candidates.candidate_gender',
  'candidates.candidate_marital_status',
  'candidates.candidate_age',
  'candidates.candidate_date_birth',
  'candidates.candidate_nationality',
  'candidates.candidate_city',
  'candidates.candidate_state',
  'candidates.candidate_country',
  'candidates.candidate_address',
  'candidates.candidate_foto',
  'candidates.candidate_resume',
  'candidates.candidate_foto_path',
  'candidates.candidate_resume_path',
  'candidates.ptk_date',
  'candidates.offering_letter',
  'candidates.remark',
  'candidates.schedule_interview',
  'candidates.group_id',
  'candidates.candidate_status',
  'candidates.candidate_status_offering_letter',
  'candidates.created_at',
  'candidates.created_by',
  'candidates.updated_at',
  'candidates.updated_by',
  'candidates.deleted_at',
  'candidates.deleted_by',
  'candidates.is_delete',
  'gate_sso_groups.group_name',
  'gate_sso_companies.company_name',
  'gate_sso_departments.department_name',
  'gate_sso_titles.title_name'
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

const applyReferenceJoins = (query) => {
  return query
    .leftJoin('gate_sso_groups', 'gate_sso_groups.group_id', 'candidates.group_id')
    .leftJoin('gate_sso_companies', 'gate_sso_companies.company_id', 'candidates.company_id')
    .leftJoin('gate_sso_departments', 'gate_sso_departments.department_id', 'candidates.department_id')
    .leftJoin('gate_sso_titles', 'gate_sso_titles.title_id', 'candidates.title_id')
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

  const baseQuery = applyReferenceJoins(pgCore(TABLE_NAME).select(SELECT_COLUMNS))
    .where({ 'candidates.deleted_at': null })
  const filteredQuery = applyStandardFilters(baseQuery, queryParams)

  let query = filteredQuery
  if (assignRoleFilter) {
    query = query.whereRaw("schedule_interview->>'assign_role' ILIKE ?", [`%${assignRoleFilter}%`])
  }

  const data = await query
  let totalQuery = buildCountQuery(
    applyReferenceJoins(pgCore(TABLE_NAME)).where({ 'candidates.deleted_at': null }),
    queryParams
  )
    .count('candidates.candidate_id as count')
    .first()

  if (assignRoleFilter) {
    totalQuery = totalQuery.whereRaw("schedule_interview->>'assign_role' ILIKE ?", [`%${assignRoleFilter}%`])
  }

  const totalResult = await totalQuery

  const total = parseInt(totalResult?.count || 0, 10)
  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await applyReferenceJoins(pgCore(TABLE_NAME).select(SELECT_COLUMNS))
    .where({ candidate_id: id, 'candidates.deleted_at': null })
    .first()
}

const create = async (data) => {
  const payload = {
    ...data,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false
  }

  const [result] = await applyReferenceJoins(pgCore(TABLE_NAME).insert(payload)).returning(SELECT_COLUMNS)
  return result
}

const update = async (id, data) => {
  const payload = {
    ...data,
    updated_at: pgCore.fn.now()
  }

  const [result] = await applyReferenceJoins(pgCore(TABLE_NAME))
    .where({ candidate_id: id, deleted_at: null })
    .update(payload)
    .returning(SELECT_COLUMNS)
  return result
}

const remove = async (id, deletedBy) => {
  const [result] = await applyReferenceJoins(pgCore(TABLE_NAME))
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
