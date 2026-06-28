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
  'is_delete'
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

  const baseQuery = pgCore(TABLE_NAME).select(SELECT_COLUMNS).where({ deleted_at: null })
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

  const [result] = await pgCore(TABLE_NAME).insert(payload).returning(SELECT_COLUMNS)
  return result
}

const update = async (id, data) => {
  const payload = {
    ...data,
    updated_at: pgCore.fn.now()
  }

  const [result] = await pgCore(TABLE_NAME)
    .where({ schedule_interview_id: id, deleted_at: null })
    .update(payload)
    .returning(SELECT_COLUMNS)
  return result
}

const remove = async (id, deletedBy) => {
  const [result] = await pgCore(TABLE_NAME)
    .where({ schedule_interview_id: id, deleted_at: null })
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
