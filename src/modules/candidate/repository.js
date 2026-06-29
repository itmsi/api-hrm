const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'candidates'
const formatCandidateNumber = (value) => {
  if (value === undefined || value === null || value === '') return null
  return `CAND-${value}`
}

const formatCandidateRows = (rows) => {
  if (!rows) return rows
  if (Array.isArray(rows)) {
    return rows.map((row) => ({
      ...row,
      candidate_number: formatCandidateNumber(row.candidate_number)
    }))
  }
  return {
    ...rows,
    candidate_number: formatCandidateNumber(rows.candidate_number)
  }
}

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
  'candidates.created_at',
  'candidates.candidate_name',
  'candidates.candidate_email',
  'candidates.candidate_number'
]
const SEARCHABLE_COLUMNS = [
  'candidates.candidate_name',
  'candidates.candidate_email',
  'candidates.candidate_number'
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

const createSelectQuery = () => {
  return applyReferenceJoins(pgCore(TABLE_NAME).select(SELECT_COLUMNS))
}

const createBaseQuery = () => {
  return pgCore(TABLE_NAME)
}

const resolveFilterColumn = (filterKey) => {
  const normalizedKey = String(filterKey || '').trim()
  const aliases = {
    group_id: 'candidates.group_id',
    company_id: 'candidates.company_id',
    department_id: 'candidates.department_id',
    title_id: 'candidates.title_id',
    candidate_status: 'candidates.candidate_status',
    candidate_status_offering_letter: 'candidates.candidate_status_offering_letter',
    assign_role: 'assign_role',
    'candidates.group_id': 'candidates.group_id',
    'candidates.company_id': 'candidates.company_id',
    'candidates.department_id': 'candidates.department_id',
    'candidates.title_id': 'candidates.title_id',
    'candidates.candidate_status': 'candidates.candidate_status',
    'candidates.candidate_status_offering_letter': 'candidates.candidate_status_offering_letter',
    'candidates.assign_role': 'assign_role'
  }

  return aliases[normalizedKey] || normalizedKey
}

const applyCandidateListFilters = (baseQuery, queryParams, assignRoleFilter) => {
  let query = baseQuery

  if (queryParams.search.searchTerm && queryParams.search.searchableColumns.length > 0) {
    query = query.where(function () {
      queryParams.search.searchableColumns.forEach((column, index) => {
        if (index === 0) {
          this.where(column, 'ilike', `%${queryParams.search.searchTerm}%`)
        } else {
          this.orWhere(column, 'ilike', `%${queryParams.search.searchTerm}%`)
        }
      })
    })
  }

  Object.keys(queryParams.filters).forEach((filterKey) => {
    const filterValue = queryParams.filters[filterKey]
    if (filterValue !== undefined && filterValue !== '') {
      const resolvedFilterKey = resolveFilterColumn(filterKey)
      if (resolvedFilterKey === 'assign_role') {
        query = query.whereRaw("schedule_interview->>'assign_role' ILIKE ?", [`%${filterValue}%`])
      } else if (filterKey === 'name' || filterKey === 'status') {
        query = query.where(resolvedFilterKey, 'ilike', `%${filterValue}%`)
      } else {
        query = query.where(resolvedFilterKey, filterValue)
      }
    }
  })

  if (assignRoleFilter) {
    query = query.whereRaw("schedule_interview->>'assign_role' ILIKE ?", [`%${assignRoleFilter}%`])
  }

  return query
}

const applyCandidateStatusOfferingCountFilters = (baseQuery, queryParams) => {
  let query = baseQuery
  const groupIdFilter = queryParams.filters.group_id ?? queryParams.filters['candidates.group_id']

  if (groupIdFilter !== undefined && groupIdFilter !== '') {
    query = query.where(resolveFilterColumn('group_id'), groupIdFilter)
  }

  return query
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

  const baseQuery = createSelectQuery()
    .where({ 'candidates.deleted_at': null })
  const filteredQuery = applyCandidateListFilters(baseQuery, queryParams, assignRoleFilter)
  const data = await filteredQuery
    .orderBy(queryParams.sorting.sortBy, queryParams.sorting.sortOrder)
    .limit(queryParams.pagination.limit)
    .offset(queryParams.pagination.offset)

  const totalQuery = applyCandidateListFilters(
    createBaseQuery().where({ 'candidates.deleted_at': null }),
    queryParams,
    assignRoleFilter
  )
    .count('candidates.candidate_id as count')
    .first()

  const countsQuery = applyCandidateStatusOfferingCountFilters(
    createBaseQuery().where({ 'candidates.deleted_at': null }),
    queryParams
  )
    .select(
      pgCore.raw('count(*) as all_count'),
      pgCore.raw("count(case when candidates.candidate_status_offering_letter = 'OK' then 1 end) as ok_count"),
      pgCore.raw("count(case when candidates.candidate_status_offering_letter = 'NOT OK' then 1 end) as not_ok_count"),
      pgCore.raw("count(case when candidates.candidate_status_offering_letter is null or trim(candidates.candidate_status_offering_letter) = '' then 1 end) as null_count")
    )
    .first()

  const [totalResult, countsResult] = await Promise.all([totalQuery, countsQuery])

  const total = parseInt(totalResult?.count || 0, 10)
  const formattedData = formatCandidateRows(data)
  const paginatedResponse = formatSimplePaginatedResponse(formattedData, queryParams.pagination, total)

  return {
    ...paginatedResponse,
    candidate_status_offering_count: {
      all: parseInt(countsResult?.all_count || 0, 10),
      ok: parseInt(countsResult?.ok_count || 0, 10),
      not_ok: parseInt(countsResult?.not_ok_count || 0, 10),
      null: parseInt(countsResult?.null_count || 0, 10)
    }
  }
}

const findById = async (id) => {
  const row = await createSelectQuery()
    .where({ candidate_id: id, 'candidates.deleted_at': null })
    .first()
  return formatCandidateRows(row)
}

const create = async (data) => {
  const payload = {
    ...data,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false
  }

  const [insertedId] = await createBaseQuery().insert(payload).returning('candidate_id')
  const result = await createSelectQuery()
    .where({ candidate_id: insertedId.candidate_id, 'candidates.deleted_at': null })
    .first()
  return formatCandidateRows(result)
}

const update = async (id, data) => {
  const payload = {
    ...data,
    updated_at: pgCore.fn.now()
  }

  const [result] = await createBaseQuery()
    .where({ candidate_id: id, deleted_at: null })
    .update(payload)
    .returning('candidate_id')

  if (!result?.candidate_id) {
    return null
  }

  const updatedRow = await createSelectQuery()
    .where({ candidate_id: result.candidate_id, 'candidates.deleted_at': null })
    .first()
  return formatCandidateRows(updatedRow)
}

const remove = async (id, deletedBy) => {
  const [result] = await createBaseQuery()
    .where({ candidate_id: id, deleted_at: null })
    .update({
      deleted_at: pgCore.fn.now(),
      deleted_by: deletedBy,
      updated_at: pgCore.fn.now(),
      is_delete: true
    })
    .returning('candidate_id')

  if (!result?.candidate_id) {
    return null
  }

  const deletedRow = await createSelectQuery()
    .where({ candidate_id: result.candidate_id, 'candidates.deleted_at': null })
    .first()
  return formatCandidateRows(deletedRow)
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
