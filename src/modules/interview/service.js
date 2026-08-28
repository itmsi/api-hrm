const repository = require('./repository')
const { parseCsvBuffer, cleanCsvValue } = require('../../utils/csvImport')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const getInterviews = async (params) => {
  return await repository.findAll(params)
}

const getInterviewById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data interview tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createInterview = async (payload, user) => {
  const authorId = getRequesterId(user)
  const existing = await repository.findByScheduleAndCompanyValue(
    payload?.schedule_interview_id,
    payload?.company_value
  )

  if (existing) {
    return await repository.update(existing.interview_id, payload, authorId)
  }

  return await repository.create(payload, authorId)
}

const updateInterview = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data interview tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, payload, authorId)
}

const deleteInterview = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data interview tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
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

const buildInterviewImportPayload = async (row, cache) => {
  const interviewId = cleanCsvValue(row.interview_id)
  if (!interviewId) {
    throw new Error('interview_id wajib diisi')
  }

  const scheduleInterviewId = cleanCsvValue(row.schedule_interview_id)
  if (!scheduleInterviewId) {
    throw new Error('schedule_interview_id wajib diisi')
  }

  const deletedAt = cleanCsvValue(row.delete_at)

  const [createdBy, updatedBy, deletedBy] = await Promise.all([
    resolveEmployeeId(row.create_by, cache),
    resolveEmployeeId(row.update_by, cache),
    resolveEmployeeId(row.delete_by, cache)
  ])

  return {
    interview_id: interviewId,
    schedule_interview_id: scheduleInterviewId,
    assigned_id: cleanCsvValue(row.assigned_id),
    company_value: cleanCsvValue(row.company_value),
    comment: cleanCsvValue(row.comment),
    created_at: cleanCsvValue(row.create_at),
    created_by: createdBy,
    updated_at: cleanCsvValue(row.update_at),
    updated_by: updatedBy,
    deleted_at: deletedAt,
    deleted_by: deletedBy,
    is_delete: Boolean(deletedAt)
  }
}

const importInterviewsFromCsv = async (fileBuffer) => {
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
      const payload = await buildInterviewImportPayload(row, employeeCache)
      const existing = await repository.findRawById(payload.interview_id)

      if (existing) {
        await repository.updateRaw(payload.interview_id, payload)
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
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  importInterviewsFromCsv
}
