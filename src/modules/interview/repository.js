const { pgCore } = require('../../config/database')
const {
  parseStandardQuery,
  applyStandardFilters,
  buildCountQuery,
  formatSimplePaginatedResponse
} = require('../../utils/standard_query')

const TABLE_NAME = 'interviews'
const DETAIL_TABLE_NAME = 'detail_interviews'
const SCHEDULE_TABLE_NAME = 'schedule_interviews'
const SCHEDULE_SELECT_COLUMNS = [
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
  'is_delete',
  'created_employee.employee_name as created_by_name',
  'updated_employee.employee_name as updated_by_name'
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
  'is_delete',
  'created_employee.employee_name as created_by_name',
  'updated_employee.employee_name as updated_by_name'
]
const ALLOWED_SORT_COLUMNS = ['created_at', 'schedule_interview_date', 'schedule_interview_time']
const SEARCHABLE_COLUMNS = ['schedule_interview_duration']
const ALLOWED_FILTER_COLUMNS = ['schedule_interview_id', 'candidate_id']

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
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${DETAIL_TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${DETAIL_TABLE_NAME}.updated_by`)
    .where({ interview_id: interview.interview_id, deleted_at: null })

  return {
    ...interview,
    detail_interviews: detailRows
  }
}

const findInterviewsBySchedule = async (scheduleInterviewId) => {
  const interviews = await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${TABLE_NAME}.updated_by`)
    .where({ schedule_interview_id: scheduleInterviewId, deleted_at: null })

  return await Promise.all(
    (Array.isArray(interviews) ? interviews : []).map((interview) => withDetails(interview))
  )
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

  const baseQuery = pgCore(SCHEDULE_TABLE_NAME)
    .select(SCHEDULE_SELECT_COLUMNS)
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${SCHEDULE_TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${SCHEDULE_TABLE_NAME}.updated_by`)
    .where({ deleted_at: null })

  const filteredQuery = applyStandardFilters(baseQuery, queryParams)
  const schedules = await filteredQuery
  const groupedData = await Promise.all(
    (Array.isArray(schedules) ? schedules : []).map(async (schedule) => ({
      ...schedule,
      data_interviews: await findInterviewsBySchedule(schedule.schedule_interview_id)
    }))
  )

  let totalQuery = buildCountQuery(
    pgCore(SCHEDULE_TABLE_NAME).where({ deleted_at: null }),
    queryParams
  )
    .count('schedule_interview_id as count')
    .first()

  const totalResult = await totalQuery
  const total = parseInt(totalResult?.count || 0, 10)

  return formatSimplePaginatedResponse(groupedData, queryParams.pagination, total)
}

const findByScheduleAndCompanyValue = async (scheduleInterviewId, companyValue) => {
  return await pgCore(TABLE_NAME)
    .select('interview_id')
    .where({
      schedule_interview_id: scheduleInterviewId,
      company_value: companyValue,
      deleted_at: null
    })
    .first()
}

const findById = async (id) => {
  const interview = await pgCore(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .leftJoin('gate_sso_employees as created_employee', 'created_employee.employee_id', `${TABLE_NAME}.created_by`)
    .leftJoin('gate_sso_employees as updated_employee', 'updated_employee.employee_id', `${TABLE_NAME}.updated_by`)
    .where({ interview_id: id, deleted_at: null })
    .first()

  return await withDetails(interview)
}

const create = async (data = {}, authorId) => {
  const { detail_interviews = [], ...interviewData } = data

  return await pgCore.transaction(async (trx) => {
    const payload = buildInterviewPayload({ ...interviewData }, authorId, trx)
    const [inserted] = await trx(TABLE_NAME).insert(payload).returning('interview_id')

    if (Array.isArray(detail_interviews) && detail_interviews.length > 0) {
      const detailPayloads = detail_interviews.map((detail) => buildDetailInterviewPayload(detail, authorId, inserted.interview_id, trx))
      await trx(DETAIL_TABLE_NAME).insert(detailPayloads)
    }

    return await withDetails({ interview_id: inserted.interview_id }, trx)
  })
}

const update = async (id, data = {}, authorId) => {
  const { detail_interviews, ...interviewData } = data

  return await pgCore.transaction(async (trx) => {
    const payload = {
      ...buildInterviewPayload({ ...interviewData }, authorId, trx),
      updated_at: trx.fn.now()
    }

    const [updated] = await trx(TABLE_NAME)
      .where({ interview_id: id, deleted_at: null })
      .update(payload)
      .returning('interview_id')

    if (!updated?.interview_id) {
      return null
    }

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

    return await withDetails({ interview_id: updated.interview_id }, trx)
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

    const [updated] = await trx(TABLE_NAME)
      .where({ interview_id: id, deleted_at: null })
      .update({
        deleted_at: trx.fn.now(),
        deleted_by: deletedBy,
        updated_at: trx.fn.now(),
        is_delete: true
      })
      .returning('interview_id')

    if (!updated?.interview_id) {
      return null
    }

    return await withDetails({ interview_id: updated.interview_id }, trx)
  })
}

const findRawById = async (id) => {
  return pgCore(TABLE_NAME).where({ interview_id: id }).first()
}

const insertRaw = async (payload) => {
  const [inserted] = await pgCore(TABLE_NAME).insert(payload).returning('interview_id')
  return inserted
}

const updateRaw = async (id, payload) => {
  const [updated] = await pgCore(TABLE_NAME)
    .where({ interview_id: id })
    .update(payload)
    .returning('interview_id')
  return updated
}

const findEmployeeIdByName = async (employeeName) => {
  return pgCore('gate_sso_employees')
    .whereRaw('lower(employee_name) = ?', [String(employeeName).trim().toLowerCase()])
    .first()
}

module.exports = {
  findAll,
  findById,
  findByScheduleAndCompanyValue,
  create,
  update,
  remove,
  findRawById,
  insertRaw,
  updateRaw,
  findEmployeeIdByName
}
