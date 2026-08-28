const repository = require('./repository')
const { pgCore } = require('../../config/database')
const candidateRepository = require('../candidate/repository')
const { parseCsvBuffer, cleanCsvValue } = require('../../utils/csvImport')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const resolveInterviewRole = (assignRole) => {
  if (!assignRole) return ''
  if (typeof assignRole === 'string') return assignRole
  if (typeof assignRole === 'object') {
    if (typeof assignRole.role === 'string') return assignRole.role
    if (typeof assignRole.value === 'string') return assignRole.value
  }
  return ''
}

const normalizeDateValue = (value) => {
  if (!value) return ''
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`
    }
    if (trimmed.length >= 10) {
      return trimmed.slice(0, 10)
    }
    return trimmed
  }
  return value
}

const syncCandidateInterviewState = async (candidateId, payload = {}) => {
  if (!candidateId) return null

  const latestInterview = await pgCore('schedule_interviews')
    .select('schedule_interview_date', 'schedule_interview_time', 'assign_role')
    .where({ candidate_id: candidateId, deleted_at: null })
    .orderByRaw("COALESCE(schedule_interview_date::text, '') DESC")
    .orderByRaw("CASE WHEN schedule_interview_time IS NULL OR COALESCE(schedule_interview_time::text, '') = '' THEN 1 ELSE 0 END ASC")
    .orderByRaw("COALESCE(schedule_interview_time::text, '') ASC")
    .first()

  const targetDate = normalizeDateValue(latestInterview?.schedule_interview_date || payload.schedule_interview_date || '')
  const targetTime = latestInterview?.schedule_interview_time || payload.schedule_interview_time || ''
  const roleValue = resolveInterviewRole(latestInterview?.assign_role || payload.assign_role)

  const candidate = await candidateRepository.findById(candidateId)
  const currentStatus = candidate?.candidate_status

  let nextStatus = currentStatus
  if (currentStatus && String(currentStatus).toLowerCase() !== 'complete' && targetDate) {
    const today = new Date()
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    nextStatus = targetDate > todayString ? 'Scheduled' : 'Interviewed'
  }

  const updatePayload = {
    schedule_interview: {
      assign_role: roleValue,
      schedule_interview_date: normalizeDateValue(targetDate),
      schedule_interview_time: targetTime,
      schedule_interview_duration: payload.schedule_interview_duration || latestInterview?.schedule_interview_duration || ''
    },
    ...(nextStatus ? { candidate_status: nextStatus } : {})
  }

  if (!candidate) return null

  return await pgCore('candidates')
    .where({ candidate_id: candidateId, deleted_at: null })
    .update(updatePayload)
}

const getScheduleInterviews = async (params) => {
  return await repository.findAll(params)
}

const getScheduleInterviewById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data schedule interview tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createScheduleInterview = async (payload, user) => {
  const authorId = getRequesterId(user)
  const result = await repository.create({
    ...payload,
    schedule_interview_date: normalizeDateValue(payload.schedule_interview_date),
    created_by: authorId,
    updated_by: authorId
  })

  await syncCandidateInterviewState(result?.candidate_id || payload.candidate_id, payload)
  return result
}

const updateScheduleInterview = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data schedule interview tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  const result = await repository.update(id, {
    ...payload,
    schedule_interview_date: normalizeDateValue(payload.schedule_interview_date),
    updated_by: authorId
  })

  await syncCandidateInterviewState(result?.candidate_id || existing.candidate_id, payload)
  return result
}

const deleteScheduleInterview = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data schedule interview tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  const result = await repository.remove(id, authorId)

  await syncCandidateInterviewState(existing.candidate_id, existing)
  return result
}

const resolveEmployeeId = async (employeeName, cache) => {
  const name = cleanCsvValue(employeeName)
  if (!name) return null
  const cacheKey = name.toLowerCase()
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const employee = await repository.findEmployeeIdByName(name)
  const employeeId = employee ? employee.employee_id : null

  cache.set(cacheKey, employeeId)
  return employeeId
}

const buildScheduleInterviewImportPayload = async (row, cache) => {
  const scheduleInterviewId = cleanCsvValue(row.schedule_interview_id)
  if (!scheduleInterviewId) {
    throw new Error('schedule_interview_id wajib diisi')
  }

  const candidateId = cleanCsvValue(row.candidate_id)
  if (!candidateId) {
    throw new Error('candidate_id wajib diisi')
  }

  const assignRoleValue = cleanCsvValue(row.assign_role)
  const deletedAt = cleanCsvValue(row.delete_at)

  const [createdBy, updatedBy, deletedBy] = await Promise.all([
    resolveEmployeeId(row.create_by, cache),
    resolveEmployeeId(row.update_by, cache),
    resolveEmployeeId(row.delete_by, cache)
  ])

  return {
    schedule_interview_id: scheduleInterviewId,
    candidate_id: candidateId,
    assign_role: assignRoleValue ? { role: assignRoleValue } : null,
    schedule_interview_date: cleanCsvValue(row.schedule_interview_date),
    schedule_interview_time: cleanCsvValue(row.schedule_interview_time),
    schedule_interview_duration: cleanCsvValue(row.schedule_interview_duration),
    created_at: cleanCsvValue(row.create_at),
    created_by: createdBy,
    updated_at: cleanCsvValue(row.update_at),
    updated_by: updatedBy,
    deleted_at: deletedAt,
    deleted_by: deletedBy,
    is_delete: Boolean(deletedAt)
  }
}

const importScheduleInterviewsFromCsv = async (fileBuffer) => {
  if (!fileBuffer) {
    throw { message: 'File CSV wajib diunggah', statusCode: 400 }
  }

  const rows = await parseCsvBuffer(fileBuffer)

  if (rows.length === 0) {
    throw { message: 'File CSV kosong atau format tidak sesuai', statusCode: 400 }
  }

  const employeeCache = new Map()
  const summary = { total_rows: rows.length, created: 0, updated: 0, failed: 0, errors: [] }

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const rowNumber = index + 2

    try {
      const payload = await buildScheduleInterviewImportPayload(row, employeeCache)
      const existing = await repository.findRawById(payload.schedule_interview_id)

      if (existing) {
        await repository.updateRaw(payload.schedule_interview_id, payload)
        summary.updated++
      } else {
        await repository.insertRaw(payload)
        summary.created++
      }
    } catch (error) {
      summary.failed++
      summary.errors.push({ row: rowNumber, message: error.message || 'Gagal memproses baris' })
    }
  }

  return summary
}

module.exports = {
  getScheduleInterviews,
  getScheduleInterviewById,
  createScheduleInterview,
  updateScheduleInterview,
  deleteScheduleInterview,
  importScheduleInterviewsFromCsv
}
