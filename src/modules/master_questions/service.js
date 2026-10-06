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

const buildPayload = (payload = {}) => ({
  question_id: normalizeOptionalString(payload.question_id),
  question_en: normalizeOptionalString(payload.question_en),
  question_cn: normalizeOptionalString(payload.question_cn),
  focus_assessment: normalizeOptionalString(payload.focus_assessment)
})

const getMasterQuestions = async (params) => {
  return await repository.findAll(params)
}

const getMasterQuestionById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data master question tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createMasterQuestion = async (payload, user) => {
  const authorId = getRequesterId(user)
  return await repository.create({
    ...buildPayload(payload),
    created_by: authorId,
    updated_by: authorId
  })
}

const updateMasterQuestion = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data master question tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, {
    ...buildPayload(payload),
    updated_by: authorId
  })
}

const deleteMasterQuestion = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data master question tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

module.exports = {
  getMasterQuestions,
  getMasterQuestionById,
  createMasterQuestion,
  updateMasterQuestion,
  deleteMasterQuestion
}
