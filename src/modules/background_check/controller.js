const service = require('./service')
const { successResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getBackgroundChecks(req.body)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.getBackgroundCheckById(id)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const create = async (req, res) => {
  try {
    console.log('---------------------------req', req)
    const data = await service.createBackgroundCheck(req.body, req.files, req.user)
    return successResponse(res, data, 'Data background check berhasil dibuat', 201)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.updateBackgroundCheck(id, req.body, req.files, req.user)
    return successResponse(res, data, 'Data background check berhasil diupdate')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteBackgroundCheck(id, req.user)
    return successResponse(res, null, 'Data background check berhasil dihapus')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const importCsv = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File CSV wajib diunggah', 400)
    }
    const data = await service.importBackgroundChecksFromCsv(req.file.buffer)
    return successResponse(res, data, 'Import data background check selesai diproses')
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
  importCsv
}
