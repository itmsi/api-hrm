const service = require('./service')
const { successResponse, errorResponse } = require('../../utils/response')

const getList = async (req, res) => {
  try {
    const data = await service.getOnBoardDocuments(req.body)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.getOnBoardDocumentById(id)
    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const create = async (req, res) => {
  try {
    const data = await service.createOnBoardDocument(req.body, req.files, req.user)
    return successResponse(res, data, 'Data on board document berhasil dibuat', 201)
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const data = await service.updateOnBoardDocument(id, req.body, req.files, req.user)
    return successResponse(res, data, 'Data on board document berhasil diupdate')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteOnBoardDocument(id, req.user)
    return successResponse(res, null, 'Data on board document berhasil dihapus')
  } catch (error) {
    return errorResponse(res, error?.message || error, error?.statusCode || 500)
  }
}

const importCsv = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'File CSV wajib diunggah', 400)
    }
    const data = await service.importOnBoardDocumentsFromCsv(req.file.buffer)
    return successResponse(res, data, 'Import data on board document selesai diproses')
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
