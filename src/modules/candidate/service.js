const { v4: uuidv4 } = require('uuid')
const repository = require('./repository')
const scheduleInterviewRepository = require('../schedule_interview/repository')
const { uploadCandidateFile, deleteFromWebdav, toDirectDownloadUrl } = require('../../utils/nextcloud')
const { analyzeCandidateResume } = require('../../utils/candidateAnalysis')
const { processCandidateInterview } = require('../../utils/candidateInterviewOrchestration')
const { parseCsvBuffer, cleanCsvValue, cleanCsvDigits } = require('../../utils/csvImport')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const getUploadedFile = (files, fieldName) => {
  if (!files || !Array.isArray(files[fieldName]) || files[fieldName].length === 0) return null
  return files[fieldName][0]
}

const parseScheduleInterview = (payload) => {
  if (!payload || typeof payload.schedule_interview === 'undefined') return payload
  if (typeof payload.schedule_interview === 'string') {
    const trimmed = payload.schedule_interview.trim()
    if (trimmed === '') {
      delete payload.schedule_interview
      return payload
    }
    try {
      payload.schedule_interview = JSON.parse(trimmed)
    } catch (error) {
      // leave as string; validation step should handle invalid JSON if needed
    }
  }
  return payload
}

const normalizeDateOnlyValue = (value) => {
  if (!value) return null
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`
    }
    return trimmed
  }
  return value
}

const hasPayloadField = (payload, fieldName) => Object.prototype.hasOwnProperty.call(payload, fieldName)

const normalizePayloadEmptyValue = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') {
      return null
    }
  }
  return value
}

const calculateOfferingLetterStatus = (offeringLetterValue, ptkDateValue) => {
  const normalizedOfferingLetter = typeof offeringLetterValue === 'string'
    ? offeringLetterValue.trim()
    : offeringLetterValue

  if (!normalizedOfferingLetter) {
    return null
  }

  const normalizedPtkDate = normalizeDateOnlyValue(ptkDateValue)
  if (!normalizedPtkDate) {
    return null
  }

  const parseDateParts = (dateValue) => {
    const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return null
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10)
    }
  }

  const offeringLetterDate = parseDateParts(normalizeDateOnlyValue(offeringLetterValue))
  const ptkDate = parseDateParts(normalizedPtkDate)

  if (!offeringLetterDate || !ptkDate) {
    return null
  }

  const start = Date.UTC(ptkDate.year, ptkDate.month - 1, ptkDate.day)
  const end = Date.UTC(offeringLetterDate.year, offeringLetterDate.month - 1, offeringLetterDate.day)
  const diffInDays = Math.abs(Math.floor((start - end) / (1000 * 60 * 60 * 24)))

  return diffInDays <= 30 ? 'OK' : 'NOT OK'
}

const analyzeResumeSafely = async (resumeUrl) => {
  try {
    return await analyzeCandidateResume(resumeUrl)
  } catch (error) {
    return null
  }
}

const processCandidateInterviewSafely = async (candidateId, analysis) => {
  try {
    await processCandidateInterview(candidateId, analysis)
  } catch (error) {
    console.error('Candidate interview orchestration failed for', candidateId, error?.message)
  }
}

const buildCandidateNumberLabel = (value) => {
  if (value === undefined || value === null || value === '') return null
  const stringValue = String(value).trim()
  if (stringValue.startsWith('CAND-')) return stringValue
  return `CAND-${stringValue}`
}

const prepareCandidatePayload = async (payload, files, existing = null) => {
  const data = parseScheduleInterview({ ...payload })
  const candidateNumber = data.candidate_number || existing?.candidate_number
  const fotoFile = getUploadedFile(files, 'candidate_foto')
  const resumeFile = getUploadedFile(files, 'candidate_resume')
  const shouldDeleteFoto = data.candidate_foto_is_delete === true
  const shouldDeleteResume = data.candidate_resume_is_delete === true

  if (data.candidate_foto === undefined || data.candidate_foto === null || (typeof data.candidate_foto === 'string' && data.candidate_foto.trim() === '')) {
    delete data.candidate_foto
  }

  if (data.candidate_resume === undefined || data.candidate_resume === null || (typeof data.candidate_resume === 'string' && data.candidate_resume.trim() === '')) {
    delete data.candidate_resume
  }

  if (data.candidate_foto_path === undefined || data.candidate_foto_path === null || (typeof data.candidate_foto_path === 'string' && data.candidate_foto_path.trim() === '')) {
    delete data.candidate_foto_path
  }

  if (data.candidate_resume_path === undefined || data.candidate_resume_path === null || (typeof data.candidate_resume_path === 'string' && data.candidate_resume_path.trim() === '')) {
    delete data.candidate_resume_path
  }

  delete data.candidate_foto_is_delete
  delete data.candidate_resume_is_delete

  if (hasPayloadField(data, 'offering_letter')) {
    data.offering_letter = normalizePayloadEmptyValue(data.offering_letter)
  }

  if (hasPayloadField(data, 'ptk_date')) {
    data.ptk_date = normalizePayloadEmptyValue(data.ptk_date)
  }

  const offeringLetterValue = hasPayloadField(data, 'offering_letter') ? data.offering_letter : existing?.offering_letter
  const ptkDateValue = hasPayloadField(data, 'ptk_date') ? data.ptk_date : existing?.ptk_date
  data.candidate_status_offering_letter = calculateOfferingLetterStatus(offeringLetterValue, ptkDateValue)

  if (shouldDeleteFoto && existing?.candidate_foto_path) {
    try {
      await deleteFromWebdav(existing.candidate_foto_path)
    } catch (error) {
      // ignore delete failure and continue to clear DB values
    }
    data.candidate_foto = null
    data.candidate_foto_path = null
  } else if (existing?.candidate_foto) {
    data.candidate_foto = existing.candidate_foto
    data.candidate_foto_path = existing.candidate_foto_path
  }

  if (shouldDeleteResume && existing?.candidate_resume_path) {
    try {
      await deleteFromWebdav(existing.candidate_resume_path)
    } catch (error) {
      // ignore delete failure and continue to clear DB values
    }
    data.candidate_resume = null
    data.candidate_resume_path = null
  } else if (existing?.candidate_resume) {
    data.candidate_resume = existing.candidate_resume
    data.candidate_resume_path = existing.candidate_resume_path
  }

  return data
}

const getCandidates = async (params) => {
  return await repository.findAll(params)
}

const getCandidateById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data kandidat tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createCandidate = async (candidateData, files, user) => {
  const authorId = getRequesterId(user)
  const payload = await prepareCandidatePayload(candidateData, files)
  const createdCandidate = await repository.create({
    ...payload,
    candidate_status: 'New',
    created_by: authorId,
    updated_by: authorId
  })

  const candidateNumber = createdCandidate?.candidate_number
  const uploadCandidateNumber = buildCandidateNumberLabel(candidateNumber)
  if (!uploadCandidateNumber) {
    return createdCandidate
  }

  const photoFile = getUploadedFile(files, 'candidate_foto')
  const resumeFile = getUploadedFile(files, 'candidate_resume')
  const hasFiles = Boolean(photoFile || resumeFile)

  if (!hasFiles) {
    return createdCandidate
  }

  const updatedPayload = { ...payload }
  if (photoFile) {
    const uploadedFoto = await uploadCandidateFile(uploadCandidateNumber, 'candidate_foto', photoFile)
    if (uploadedFoto) {
      updatedPayload.candidate_foto = uploadedFoto.url
      updatedPayload.candidate_foto_path = uploadedFoto.path
    }
  }
  if (resumeFile) {
    const uploadedResume = await uploadCandidateFile(uploadCandidateNumber, 'candidate_resume', resumeFile)
    if (uploadedResume) {
      updatedPayload.candidate_resume = uploadedResume.url
      updatedPayload.candidate_resume_path = uploadedResume.path
      updatedPayload.candidate_growth_analysis = await analyzeResumeSafely(toDirectDownloadUrl(uploadedResume.url))
    }
  }

  const finalCandidate = await repository.update(createdCandidate.candidate_id, {
    ...updatedPayload,
    updated_by: authorId
  })

  if (updatedPayload.candidate_growth_analysis) {
    await processCandidateInterviewSafely(createdCandidate.candidate_id, updatedPayload.candidate_growth_analysis)
  }

  return finalCandidate
}

const updateCandidate = async (id, candidateData, files, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data kandidat tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  const payload = await prepareCandidatePayload(candidateData, files, existing)
  const updatedCandidate = await repository.update(id, {
    ...payload,
    updated_by: authorId
  })

  const candidateNumber = updatedCandidate?.candidate_number
  const uploadCandidateNumber = buildCandidateNumberLabel(candidateNumber)
  if (!uploadCandidateNumber) {
    return updatedCandidate
  }

  const photoFile = getUploadedFile(files, 'candidate_foto')
  const resumeFile = getUploadedFile(files, 'candidate_resume')
  const hasFiles = Boolean(photoFile || resumeFile)

  if (!hasFiles) {
    return updatedCandidate
  }

  const updatedPayload = { ...payload }
  if (photoFile) {
    const uploadedFoto = await uploadCandidateFile(uploadCandidateNumber, 'candidate_foto', photoFile)
    if (uploadedFoto) {
      updatedPayload.candidate_foto = uploadedFoto.url
      updatedPayload.candidate_foto_path = uploadedFoto.path
    }
  }
  if (resumeFile) {
    const uploadedResume = await uploadCandidateFile(uploadCandidateNumber, 'candidate_resume', resumeFile)
    if (uploadedResume) {
      updatedPayload.candidate_resume = uploadedResume.url
      updatedPayload.candidate_resume_path = uploadedResume.path
      updatedPayload.candidate_growth_analysis = await analyzeResumeSafely(toDirectDownloadUrl(uploadedResume.url))
    }
  }

  const finalCandidate = await repository.update(id, {
    ...updatedPayload,
    updated_by: authorId
  })

  if (updatedPayload.candidate_growth_analysis) {
    await processCandidateInterviewSafely(id, updatedPayload.candidate_growth_analysis)
  }

  return finalCandidate
}

const deleteCandidate = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data kandidat tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

const resolveCompanyId = async (companyName, authorId, cache) => {
  const name = cleanCsvValue(companyName)
  if (!name) return null
  const cacheKey = name.toLowerCase()
  if (cache.companies.has(cacheKey)) return cache.companies.get(cacheKey)

  const existing = await repository.findCompanyByName(name)
  const companyId = existing
    ? existing.company_id
    : await repository.createCompany({ companyId: uuidv4(), companyName: name, authorId })

  cache.companies.set(cacheKey, companyId)
  return companyId
}

const resolveDepartmentId = async (departmentName, companyId, authorId, cache) => {
  const name = cleanCsvValue(departmentName)
  if (!name || !companyId) return null
  const cacheKey = `${companyId}::${name.toLowerCase()}`
  if (cache.departments.has(cacheKey)) return cache.departments.get(cacheKey)

  const existing = await repository.findDepartmentByNameAndCompany(name, companyId)
  const departmentId = existing
    ? existing.department_id
    : await repository.createDepartment({ departmentId: uuidv4(), departmentName: name, companyId, authorId })

  cache.departments.set(cacheKey, departmentId)
  return departmentId
}

const resolveTitleId = async (titleName, departmentId, authorId, cache) => {
  const name = cleanCsvValue(titleName)
  if (!name || !departmentId) return null
  const cacheKey = `${departmentId}::${name.toLowerCase()}`
  if (cache.titles.has(cacheKey)) return cache.titles.get(cacheKey)

  const existing = await repository.findTitleByNameAndDepartment(name, departmentId)
  const titleId = existing
    ? existing.title_id
    : await repository.createTitle({ titleId: uuidv4(), titleName: name, departmentId, authorId })

  cache.titles.set(cacheKey, titleId)
  return titleId
}

const importCandidatesFromCsv = async (fileBuffer, user) => {
  if (!fileBuffer) {
    throw { message: 'File CSV wajib diunggah', statusCode: 400 }
  }

  const authorId = getRequesterId(user)
  const rows = await parseCsvBuffer(fileBuffer)

  if (rows.length === 0) {
    throw { message: 'File CSV kosong atau format tidak sesuai', statusCode: 400 }
  }

  const cache = { companies: new Map(), departments: new Map(), titles: new Map() }
  const summary = { total_rows: rows.length, created: 0, updated: 0, failed: 0, errors: [] }

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const rowNumber = index + 2

    try {
      const candidateId = cleanCsvValue(row.candidate_id)
      if (!candidateId) {
        throw new Error('candidate_id wajib diisi')
      }

      const companyId = await resolveCompanyId(row.company_id, authorId, cache)
      const departmentId = await resolveDepartmentId(row.department_id, companyId, authorId, cache)
      const titleId = await resolveTitleId(row.title_id, departmentId, authorId, cache)

      const payload = {
        candidate_id: candidateId,
        company_id: companyId,
        department_id: departmentId,
        title_id: titleId,
        candidate_number: cleanCsvDigits(row.candidate_number),
        candidate_name: cleanCsvValue(row.candidate_name),
        candidate_email: cleanCsvValue(row.candidate_email),
        candidate_phone: cleanCsvValue(row.candidate_phone),
        candidate_religion: cleanCsvValue(row.candidate_religion),
        candidate_gender: cleanCsvValue(row.candidate_gender),
        candidate_marital_status: cleanCsvValue(row.candidate_marital_status),
        candidate_age: cleanCsvDigits(row.candidate_age),
        candidate_date_birth: cleanCsvValue(row.candidate_date_birth),
        candidate_nationality: cleanCsvValue(row.candidate_nationality),
        candidate_city: cleanCsvValue(row.candidate_city),
        candidate_state: cleanCsvValue(row.candidate_state),
        candidate_country: cleanCsvValue(row.candidate_country),
        candidate_address: cleanCsvValue(row.candidate_address),
        candidate_foto: cleanCsvValue(row.candidate_foto),
        candidate_resume: cleanCsvValue(row.candidate_resume)
      }

      const existingCandidate = await repository.findById(candidateId)

      if (existingCandidate) {
        await repository.update(candidateId, {
          ...payload,
          updated_by: authorId
        })
        summary.updated++
      } else {
        await repository.create({
          ...payload,
          candidate_status: 'New',
          created_by: authorId,
          updated_by: authorId
        })
        summary.created++
      }
    } catch (error) {
      summary.failed++
      summary.errors.push({ row: rowNumber, message: error.message || 'Gagal memproses baris' })
    }
  }

  return summary
}

const resolveAssignRoleLabel = (assignRole) => {
  if (!assignRole) return null
  if (typeof assignRole === 'string') return assignRole
  if (typeof assignRole === 'object') {
    if (typeof assignRole.role === 'string') return assignRole.role
    if (typeof assignRole.value === 'string') return assignRole.value
  }
  return null
}

const combineAssignRoleLabels = (schedules) => {
  const labels = []
  const seen = new Set()

  schedules.forEach((schedule) => {
    const label = resolveAssignRoleLabel(schedule.assign_role)
    if (!label) return
    label.split(',').forEach((part) => {
      const trimmed = part.trim()
      if (!trimmed) return
      const key = trimmed.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      labels.push(trimmed)
    })
  })

  return labels.length > 0 ? labels.join(', ') : null
}

const backfillCandidateScheduleInterview = async () => {
  const candidates = await repository.findCandidatesMissingScheduleInterview()
  const summary = { total_checked: candidates.length, updated: 0, skipped: 0, errors: [] }

  for (const candidate of candidates) {
    try {
      const schedules = await scheduleInterviewRepository.findAllByCandidateId(candidate.candidate_id)

      if (!schedules || schedules.length === 0) {
        summary.skipped++
        continue
      }

      const latestSchedule = schedules[0]
      const scheduleInterviewJson = {
        assign_role: combineAssignRoleLabels(schedules),
        schedule_interview_date: normalizeDateOnlyValue(latestSchedule.schedule_interview_date),
        schedule_interview_time: latestSchedule.schedule_interview_time,
        schedule_interview_duration: latestSchedule.schedule_interview_duration
      }

      await repository.updateScheduleInterviewJson(candidate.candidate_id, scheduleInterviewJson)
      summary.updated++
    } catch (error) {
      summary.errors.push({ candidate_id: candidate.candidate_id, message: error.message || 'Gagal memproses data' })
    }
  }

  return summary
}

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  importCandidatesFromCsv,
  backfillCandidateScheduleInterview
}
