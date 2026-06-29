const repository = require('./repository')
const { pgCore } = require('../../config/database')
const candidateRepository = require('../candidate/repository')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.sub || null
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

module.exports = {
  getScheduleInterviews,
  getScheduleInterviewById,
  createScheduleInterview,
  updateScheduleInterview,
  deleteScheduleInterview
}
