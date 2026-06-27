const service = require('./service')
const { baseResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getCandidates(req.body)
    return baseResponse(res, { data })
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.getCandidateById(id)
    return baseResponse(res, { data })
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const create = async (req, res) => {
  try {
    const data = await service.createCandidate(req.body, req.user)
    return baseResponse(res, {
      data,
      message: 'Data kandidat berhasil dibuat'
    }, 201)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.updateCandidate(id, req.body, req.user)
    return baseResponse(res, {
      data,
      message: 'Data kandidat berhasil diupdate'
    })
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteCandidate(id, req.user)
    return baseResponse(res, {
      message: 'Data kandidat berhasil dihapus'
    })
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

module.exports = {
  getList,
  getById,
  create,
  update,
  remove
}
