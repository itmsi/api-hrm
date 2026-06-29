const repository = require('./repository')
const { uploadOnBoardDocumentFile } = require('../../utils/nextcloud')

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

const prepareOnBoardDocumentPayload = async (payload = {}, files, existing = null) => {
  const data = { ...payload }
  const uploadedFile = getUploadedFile(files, 'on_board_documents_file')

  if (data.on_board_documents_file === undefined || data.on_board_documents_file === null || (typeof data.on_board_documents_file === 'string' && data.on_board_documents_file.trim() === '')) {
    delete data.on_board_documents_file
  }

  if (data.on_board_documents_file_path === undefined || data.on_board_documents_file_path === null || (typeof data.on_board_documents_file_path === 'string' && data.on_board_documents_file_path.trim() === '')) {
    delete data.on_board_documents_file_path
  }

  if (uploadedFile) {
    const candidateId = normalizeOptionalString(data.candidate_id || existing?.candidate_id)
    if (!candidateId) {
      throw { message: 'candidate_id harus diisi saat mengupload on_board_documents_file', statusCode: 400 }
    }

    const uploaded = await uploadOnBoardDocumentFile(candidateId, 'on_board_documents_file', uploadedFile)
    if (uploaded) {
      data.on_board_documents_file = uploaded.url
      data.on_board_documents_file_path = uploaded.path
    }
  } else if (existing?.on_board_documents_file) {
    data.on_board_documents_file = existing.on_board_documents_file
    data.on_board_documents_file_path = existing.on_board_documents_file_path
  }

  return {
    candidate_id: normalizeOptionalString(data.candidate_id),
    on_board_documents_name: normalizeOptionalString(data.on_board_documents_name),
    on_board_documents_file: normalizeOptionalString(data.on_board_documents_file),
    on_board_documents_file_path: normalizeOptionalString(data.on_board_documents_file_path)
  }
}

const getOnBoardDocuments = async (params) => {
  return await repository.findAll(params)
}

const getOnBoardDocumentById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data on board document tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createOnBoardDocument = async (payload, files, user) => {
  const authorId = getRequesterId(user)
  const preparedPayload = await prepareOnBoardDocumentPayload(payload, files)
  return await repository.create({
    ...preparedPayload,
    created_by: authorId,
    updated_by: authorId
  })
}

const updateOnBoardDocument = async (id, payload, files, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data on board document tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  const preparedPayload = await prepareOnBoardDocumentPayload(payload, files, existing)
  return await repository.update(id, {
    ...preparedPayload,
    updated_by: authorId
  })
}

const deleteOnBoardDocument = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data on board document tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

module.exports = {
  getOnBoardDocuments,
  getOnBoardDocumentById,
  createOnBoardDocument,
  updateOnBoardDocument,
  deleteOnBoardDocument
}
