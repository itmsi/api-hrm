const repository = require('./repository')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.sub || null
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
  return await repository.create({
    ...payload,
    created_by: authorId,
    updated_by: authorId
  })
}

const updateScheduleInterview = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data schedule interview tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, {
    ...payload,
    updated_by: authorId
  })
}

const deleteScheduleInterview = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data schedule interview tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

module.exports = {
  getScheduleInterviews,
  getScheduleInterviewById,
  createScheduleInterview,
  updateScheduleInterview,
  deleteScheduleInterview
}
