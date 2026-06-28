const service = require('./service')
const { successResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getScheduleInterviews(req.body)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.getScheduleInterviewById(id)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const create = async (req, res) => {
  try {
    const data = await service.createScheduleInterview(req.body, req.user)
    return successResponse(res, data, 'Data schedule interview berhasil dibuat', 201)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.updateScheduleInterview(id, req.body, req.user)
    return successResponse(res, data, 'Data schedule interview berhasil diupdate')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteScheduleInterview(id, req.user)
    return successResponse(res, null, 'Data schedule interview berhasil dihapus')
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
