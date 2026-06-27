const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatPaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'candidates'
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

const findAll = async (params = {}) => {
  const queryParams = parseStandardQuery(
    { body: params },
    {
      allowedColumns: ALLOWED_SORT_COLUMNS,
      defaultOrder: ['created_at', 'desc'],
      searchableColumns: SEARCHABLE_COLUMNS,
      fromBody: true
    }
  )

  const baseQuery = pgCore(TABLE_NAME).select('*').where({ deleted_at: null })
  const filteredQuery = applyStandardFilters(baseQuery, queryParams)

  const data = await filteredQuery
  const totalResult = await buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('candidate_id as count')
    .first()

  const total = parseInt(totalResult?.count || 0, 10)
  return formatPaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
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

  const [result] = await pgCore(TABLE_NAME).insert(payload).returning('*')
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
    .returning('*')
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
    .returning('*')
  return result
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
