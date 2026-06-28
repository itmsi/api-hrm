const repository = require('./repository')
const { uploadCandidateFile, deleteFromWebdav } = require('../../utils/nextcloud')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.sub || null
}

const getUploadedFile = (files, fieldName) => {
  if (!files || !Array.isArray(files[fieldName]) || files[fieldName].length === 0) return null
  return files[fieldName][0]
}

const parseScheduleInterview = (payload) => {
  if (!payload || typeof payload.schedule_interview === 'undefined') return payload
  if (typeof payload.schedule_interview === 'string') {
    const trimmed = payload.schedule_interview.trim()
    if (trimmed === '') {
      delete payload.schedule_interview
      return payload
    }
    try {
      payload.schedule_interview = JSON.parse(trimmed)
    } catch (error) {
      // leave as string; validation step should handle invalid JSON if needed
    }
  }
  return payload
}

const prepareCandidatePayload = async (payload, files, existing = null) => {
  const data = parseScheduleInterview({ ...payload })
  const candidateNumber = data.candidate_number || existing?.candidate_number
  const fotoFile = getUploadedFile(files, 'candidate_foto')
  const resumeFile = getUploadedFile(files, 'candidate_resume')
  const shouldDeleteFoto = data.candidate_foto_is_delete === true
  const shouldDeleteResume = data.candidate_resume_is_delete === true

  if (data.candidate_foto === undefined || data.candidate_foto === null || (typeof data.candidate_foto === 'string' && data.candidate_foto.trim() === '')) {
    delete data.candidate_foto
  }

  if (data.candidate_resume === undefined || data.candidate_resume === null || (typeof data.candidate_resume === 'string' && data.candidate_resume.trim() === '')) {
    delete data.candidate_resume
  }

  if (data.candidate_foto_path === undefined || data.candidate_foto_path === null || (typeof data.candidate_foto_path === 'string' && data.candidate_foto_path.trim() === '')) {
    delete data.candidate_foto_path
  }

  if (data.candidate_resume_path === undefined || data.candidate_resume_path === null || (typeof data.candidate_resume_path === 'string' && data.candidate_resume_path.trim() === '')) {
    delete data.candidate_resume_path
  }

  delete data.candidate_foto_is_delete
  delete data.candidate_resume_is_delete

  if ((!candidateNumber || candidateNumber.trim() === '') && (fotoFile || resumeFile)) {
    throw { message: 'candidate_number harus diisi saat mengunggah file', statusCode: 400 }
  }

  if (shouldDeleteFoto && existing?.candidate_foto_path) {
    try {
      await deleteFromWebdav(existing.candidate_foto_path)
    } catch (error) {
      // ignore delete failure and continue to clear DB values
    }
    data.candidate_foto = null
    data.candidate_foto_path = null
  } else if (fotoFile) {
    const uploadedFoto = await uploadCandidateFile(candidateNumber, 'candidate_foto', fotoFile)
    if (uploadedFoto) {
      data.candidate_foto = uploadedFoto.url
      data.candidate_foto_path = uploadedFoto.path
    }
  } else if (existing?.candidate_foto) {
    data.candidate_foto = existing.candidate_foto
    data.candidate_foto_path = existing.candidate_foto_path
  }

  if (shouldDeleteResume && existing?.candidate_resume_path) {
    try {
      await deleteFromWebdav(existing.candidate_resume_path)
    } catch (error) {
      // ignore delete failure and continue to clear DB values
    }
    data.candidate_resume = null
    data.candidate_resume_path = null
  } else if (resumeFile) {
    const uploadedResume = await uploadCandidateFile(candidateNumber, 'candidate_resume', resumeFile)
    if (uploadedResume) {
      data.candidate_resume = uploadedResume.url
      data.candidate_resume_path = uploadedResume.path
    }
  } else if (existing?.candidate_resume) {
    data.candidate_resume = existing.candidate_resume
    data.candidate_resume_path = existing.candidate_resume_path
  }

  return data
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

const createCandidate = async (candidateData, files, user) => {
  const authorId = getRequesterId(user)
  const payload = await prepareCandidatePayload(candidateData, files)
  return await repository.create({
    ...payload,
    created_by: authorId,
    updated_by: authorId
  })
}

const updateCandidate = async (id, candidateData, files, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data kandidat tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  const payload = await prepareCandidatePayload(candidateData, files, existing)
  return await repository.update(id, {
    ...payload,
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
