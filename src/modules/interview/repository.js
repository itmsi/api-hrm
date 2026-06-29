const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'interviews'
const DETAIL_TABLE_NAME = 'detail_interviews'
const SELECT_COLUMNS = [
  'interview_id',
  'schedule_interview_id',
  'assigned_id',
  'company_value',
  'comment',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const DETAIL_SELECT_COLUMNS = [
  'detail_interview_id',
  'interview_id',
  'aspect',
  'question',
  'answer',
  'score',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
  'deleted_at',
  'deleted_by',
  'is_delete'
]
const ALLOWED_SORT_COLUMNS = ['created_at', 'company_value', 'comment']
const SEARCHABLE_COLUMNS = ['company_value', 'comment']
const ALLOWED_FILTER_COLUMNS = ['schedule_interview_id']

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

const buildInterviewPayload = (payload = {}, authorId, trx) => {
  const { detail_interviews, ...interviewData } = payload
  return {
    ...interviewData,
    schedule_interview_id: normalizeNullableValue(interviewData.schedule_interview_id),
    assigned_id: normalizeNullableValue(interviewData.assigned_id),
    company_value: normalizeNullableValue(interviewData.company_value),
    comment: normalizeNullableValue(interviewData.comment),
    created_by: authorId,
    updated_by: authorId,
    created_at: trx.fn.now(),
    updated_at: trx.fn.now(),
    is_delete: false
  }
}

const buildDetailInterviewPayload = (detail = {}, authorId, interviewId, trx) => {
  const scoreValue = detail.score === undefined || detail.score === null || detail.score === ''
    ? '0'
    : String(detail.score)

  return {
    interview_id: interviewId,
    aspect: normalizeNullableValue(detail.aspect),
    question: normalizeNullableValue(detail.question),
    answer: normalizeNullableValue(detail.answer),
    score: scoreValue,
    created_by: authorId,
    updated_by: authorId,
    created_at: trx.fn.now(),
    updated_at: trx.fn.now(),
    is_delete: false
  }
}

const withDetails = async (interview, trx = pgCore) => {
  if (!interview) return null
  const detailRows = await trx(DETAIL_TABLE_NAME)
    .select(DETAIL_SELECT_COLUMNS)
    .where({ interview_id: interview.interview_id, deleted_at: null })

  return {
    ...interview,
    detail_interviews: detailRows
  }
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
    .count('interview_id as count')
    .first()

  const totalResult = await totalQuery
  const total = parseInt(totalResult?.count || 0, 10)

  return formatSimplePaginatedResponse(data, queryParams.pagination, total)
}

const findById = async (id) => {
  const interview = await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .where({ interview_id: id, deleted_at: null })
    .first()

  return await withDetails(interview)
}

const create = async (data = {}, authorId) => {
  const { detail_interviews = [], ...interviewData } = data

  return await pgCore.transaction(async (trx) => {
    const payload = buildInterviewPayload({ ...interviewData }, authorId, trx)
    const [result] = await trx(TABLE_NAME).insert(payload).returning(SELECT_COLUMNS)

    if (Array.isArray(detail_interviews) && detail_interviews.length > 0) {
      const detailPayloads = detail_interviews.map((detail) => buildDetailInterviewPayload(detail, authorId, result.interview_id, trx))
      await trx(DETAIL_TABLE_NAME).insert(detailPayloads)
    }

    return await withDetails(result, trx)
  })
}

const update = async (id, data = {}, authorId) => {
  const { detail_interviews, ...interviewData } = data

  return await pgCore.transaction(async (trx) => {
    const payload = {
      ...buildInterviewPayload({ ...interviewData }, authorId, trx),
      updated_at: trx.fn.now()
    }

    const [result] = await trx(TABLE_NAME)
      .where({ interview_id: id, deleted_at: null })
      .update(payload)
      .returning(SELECT_COLUMNS)

    if (Array.isArray(detail_interviews)) {
      await trx(DETAIL_TABLE_NAME)
        .where({ interview_id: id, deleted_at: null })
        .update({
          deleted_at: trx.fn.now(),
          deleted_by: authorId,
          updated_at: trx.fn.now(),
          is_delete: true
        })

      if (detail_interviews.length > 0) {
        const detailPayloads = detail_interviews.map((detail) => buildDetailInterviewPayload(detail, authorId, id, trx))
        await trx(DETAIL_TABLE_NAME).insert(detailPayloads)
      }
    }

    return await withDetails(result, trx)
  })
}

const remove = async (id, deletedBy) => {
  return await pgCore.transaction(async (trx) => {
    await trx(DETAIL_TABLE_NAME)
      .where({ interview_id: id, deleted_at: null })
      .update({
        deleted_at: trx.fn.now(),
        deleted_by: deletedBy,
        updated_at: trx.fn.now(),
        is_delete: true
      })

    const [result] = await trx(TABLE_NAME)
      .where({ interview_id: id, deleted_at: null })
      .update({
        deleted_at: trx.fn.now(),
        deleted_by: deletedBy,
        updated_at: trx.fn.now(),
        is_delete: true
      })
      .returning(SELECT_COLUMNS)

    return result
  })
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
}
