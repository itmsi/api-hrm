const repository = require('./repository')

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

module.exports = {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview
}
