const repository = require('./repository')
const candidateRepository = require('../candidate/repository')
const { uploadBackgroundCheckFile } = require('../../utils/nextcloud')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.sub || null
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

module.exports = {
  getBackgroundChecks,
  getBackgroundCheckById,
  createBackgroundCheck,
  updateBackgroundCheck,
  deleteBackgroundCheck
}
