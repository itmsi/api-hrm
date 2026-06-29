const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'on_board_documents'
const SELECT_COLUMNS = [
  'on_board_documents_id',
  'candidate_id',
  'on_board_documents_name',
  'on_board_documents_file',
  'on_board_documents_file_path',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const ALLOWED_SORT_COLUMNS = ['created_at', 'on_board_documents_name']
const SEARCHABLE_COLUMNS = ['on_board_documents_name']
const ALLOWED_FILTER_COLUMNS = ['candidate_id']

const normalizeFilterValue = (value) => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return value
  const normalized = value.trim().toLowerCase()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return undefined
  return value
}

const normalizeNullableValue = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const normalized = value.trim()
  if (normalized === '' || normalized === 'null' || normalized === 'nan') return null
  return normalized
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
    .where({ deleted_at: null })

  const filteredQuery = applyStandardFilters(baseQuery, queryParams)
  const data = await filteredQuery

  let totalQuery = buildCountQuery(
    pgCore(TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('on_board_documents_id as count')
    .first()

  const totalResult = await totalQuery
  const total = parseInt(totalResult?.count || 0, 10)

  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  return await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ on_board_documents_id: id, deleted_at: null })
    .first()
}

const create = async (data = {}, authorId) => {
  const payload = {
    candidate_id: normalizeNullableValue(data.candidate_id),
    on_board_documents_name: normalizeNullableValue(data.on_board_documents_name),
    on_board_documents_file: normalizeNullableValue(data.on_board_documents_file),
    on_board_documents_file_path: normalizeNullableValue(data.on_board_documents_file_path),
    created_by: authorId || data.created_by || null,
    updated_by: authorId || data.updated_by || null,
    created_at: pgCore.fn.now(),
    updated_at: pgCore.fn.now(),
    is_delete: false
  }

  const [result] = await pgCore(TABLE_NAME).insert(payload).returning(SELECT_COLUMNS)
  return result
}

const update = async (id, data = {}, authorId) => {
  const payload = {
    candidate_id: normalizeNullableValue(data.candidate_id),
    on_board_documents_name: normalizeNullableValue(data.on_board_documents_name),
    on_board_documents_file: normalizeNullableValue(data.on_board_documents_file),
    on_board_documents_file_path: normalizeNullableValue(data.on_board_documents_file_path),
    updated_by: authorId || data.updated_by || null,
    updated_at: pgCore.fn.now()
  }

  const [result] = await pgCore(TABLE_NAME)
    .where({ on_board_documents_id: id, deleted_at: null })
    .update(payload)
    .returning(SELECT_COLUMNS)

  return result
}

const remove = async (id, deletedBy) => {
  const [result] = await pgCore(TABLE_NAME)
    .where({ on_board_documents_id: id, deleted_at: null })
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
