const repository = require('./repository')
const candidateRepository = require('../candidate/repository')
const { uploadBackgroundCheckFile } = require('../../utils/nextcloud')
const { pgCore } = require('../../config/database')
const { parseCsvBuffer, cleanCsvValue } = require('../../utils/csvImport')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const getUploadedFile = (files, fieldName) => {
  if (!files || !Array.isArray(files[fieldName]) || files[fieldName].length === 0) return null
  return files[fieldName][0]
}

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return null
  return trimmed
}

const markCandidateAsComplete = async (candidateId, authorId) => {
  if (!candidateId) return null
  return await candidateRepository.update(candidateId, {
    candidate_status: 'Complete',
    updated_by: authorId
  })
}

const prepareBackgroundCheckPayload = async (payload = {}, files, existing = null) => {
  const data = { ...payload }
  const uploadedFile = getUploadedFile(files, 'file_attachment')

  if (data.file_attachment === undefined || data.file_attachment === null || (typeof data.file_attachment === 'string' && data.file_attachment.trim() === '')) {
    delete data.file_attachment
  }

  if (data.file_attachment_path === undefined || data.file_attachment_path === null || (typeof data.file_attachment_path === 'string' && data.file_attachment_path.trim() === '')) {
    delete data.file_attachment_path
  }

  if (uploadedFile) {
    const candidateId = normalizeOptionalString(data.candidate_id || existing?.candidate_id)
    if (!candidateId) {
      throw { message: 'candidate_id harus diisi saat mengupload file_attachment', statusCode: 400 }
    }

    const uploaded = await uploadBackgroundCheckFile(candidateId, 'file_attachment', uploadedFile)
    if (uploaded) {
      data.file_attachment = uploaded.url
      data.file_attachment_path = uploaded.path
    }
  } else if (existing?.file_attachment) {
    data.file_attachment = existing.file_attachment
    data.file_attachment_path = existing.file_attachment_path
  }

  return {
    candidate_id: normalizeOptionalString(data.candidate_id),
    background_check_note: normalizeOptionalString(data.background_check_note),
    background_check_status: normalizeOptionalString(data.background_check_status),
    file_attachment: normalizeOptionalString(data.file_attachment),
    file_attachment_path: normalizeOptionalString(data.file_attachment_path)
  }
}

const getBackgroundChecks = async (params) => {
  return await repository.findAll(params)
}

const getBackgroundCheckById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data background check tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createBackgroundCheck = async (payload, files, user) => {
  const authorId = getRequesterId(user)
  const preparedPayload = await prepareBackgroundCheckPayload(payload, files)
  const createdBackgroundCheck = await repository.create({
    ...preparedPayload,
    created_by: authorId,
    updated_by: authorId
  })

  await markCandidateAsComplete(preparedPayload.candidate_id, authorId)

  return createdBackgroundCheck
}

const updateBackgroundCheck = async (id, payload, files, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data background check tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  const preparedPayload = await prepareBackgroundCheckPayload(payload, files, existing)
  const updatedBackgroundCheck = await repository.update(id, {
    ...preparedPayload,
    updated_by: authorId
  })

  await markCandidateAsComplete(preparedPayload.candidate_id, authorId)

  return updatedBackgroundCheck
}

const deleteBackgroundCheck = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data background check tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

const buildBackgroundCheckImportPayload = (row) => {
  const backgroundCheckId = cleanCsvValue(row.background_check_id)
  if (!backgroundCheckId) {
    throw new Error('background_check_id wajib diisi')
  }

  const candidateId = cleanCsvValue(row.candidate_id)
  if (!candidateId) {
    throw new Error('candidate_id wajib diisi')
  }

  return {
    background_check_id: backgroundCheckId,
    candidate_id: candidateId,
    background_check_note: cleanCsvValue(row.background_check_note),
    file_attachment: cleanCsvValue(row.file_attachment),
    background_check_status: cleanCsvValue(row.background_check_status)
  }
}

const importBackgroundChecksFromCsv = async (fileBuffer) => {
  if (!fileBuffer) {
    throw { message: 'File CSV wajib diunggah', statusCode: 400 }
  }

  const rows = await parseCsvBuffer(fileBuffer)

  if (rows.length === 0) {
    throw { message: 'File CSV kosong atau format tidak sesuai', statusCode: 400 }
  }

  const summary = { total_rows: rows.length, created: 0, updated: 0, failed: 0, errors: [] }

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const rowNumber = index + 2

    try {
      const payload = buildBackgroundCheckImportPayload(row)
      const existing = await repository.findRawById(payload.background_check_id)

      if (existing) {
        await repository.updateRaw(payload.background_check_id, {
          ...payload,
          updated_at: pgCore.fn.now()
        })
        summary.updated++
      } else {
        await repository.insertRaw({
          ...payload,
          created_at: pgCore.fn.now(),
          updated_at: pgCore.fn.now(),
          is_delete: false
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

module.exports = {
  getBackgroundChecks,
  getBackgroundCheckById,
  createBackgroundCheck,
  updateBackgroundCheck,
  deleteBackgroundCheck,
  importBackgroundChecksFromCsv
}
