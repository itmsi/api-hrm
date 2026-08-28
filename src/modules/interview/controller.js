const service = require('./service')
const { successResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getInterviews(req.body)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.getInterviewById(id)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const create = async (req, res) => {
  try {
    const data = await service.createInterview(req.body, req.user)
    return successResponse(res, data, 'Data interview berhasil dibuat', 201)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.updateInterview(id, req.body, req.user)
    return successResponse(res, data, 'Data interview berhasil diupdate')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteInterview(id, req.user)
    return successResponse(res, null, 'Data interview berhasil dihapus')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const importCsv = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File CSV wajib diunggah', 400)
    }
    const data = await service.importInterviewsFromCsv(req.file.buffer)
    return successResponse(res, data, 'Import data interview selesai diproses')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const importDetailCsv = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File CSV wajib diunggah', 400)
    }
    const data = await service.importDetailInterviewsFromCsv(req.file.buffer)
    return successResponse(res, data, 'Import data detail interview selesai diproses')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

module.exports = {
  getList,
  getById,
  create,
  update,
  remove,
  importCsv,
  importDetailCsv
}
