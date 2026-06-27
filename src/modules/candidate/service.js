const repository = require('./repository')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.sub || null
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

const createCandidate = async (candidateData, user) => {
  const authorId = getRequesterId(user)
  return await repository.create({
    ...candidateData,
    created_by: authorId,
    updated_by: authorId
  })
}

const updateCandidate = async (id, candidateData, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data kandidat tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, {
    ...candidateData,
    updated_by: authorId
  })
}

const deleteCandidate = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data kandidat tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
}
