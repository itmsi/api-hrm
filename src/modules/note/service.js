const repository = require('./repository')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return null
  return trimmed
}

const getNotes = async (params) => {
  return await repository.findAll(params)
}

const getNoteById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data note tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createNote = async (payload, user) => {
  const authorId = getRequesterId(user)
  return await repository.create({
    candidate_id: normalizeOptionalString(payload?.candidate_id),
    notes: normalizeOptionalString(payload?.notes),
    created_by: authorId,
    updated_by: authorId
  })
}

const updateNote = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data note tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, {
    candidate_id: normalizeOptionalString(payload?.candidate_id),
    notes: normalizeOptionalString(payload?.notes),
    updated_by: authorId
  })
}

const deleteNote = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data note tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
}
