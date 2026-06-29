const axios = require('axios')
const path = require('path')
const candidateRepository = require('../modules/candidate/repository')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: true })

const posix = path.posix

const normalizeBaseUrl = (value = '') => String(value || '').trim().replace(/\/+$/g, '')

const normalizePath = (value = '', fallback = '') => {
  const cleaned = String(value || '').trim()
  if (!cleaned) return fallback
  return `/${cleaned.replace(/^\/+|\/+$/g, '')}`
}

const getConfig = () => ({
  baseUrl: normalizeBaseUrl(process.env.NEXTCLOUD_URL),
  webdavPath: normalizePath(process.env.NEXTCLOUD_WEBDAV_PATH, '/remote.php/webdav'),
  shareApiPath: normalizePath(process.env.NEXTCLOUD_SHARE_API_PATH, '/ocs/v1.php/apps/files_sharing/api/v1/shares'),
  uploadDir: normalizePath(process.env.NEXTCLOUD_UPLOAD_DIR, '/HRM'),
  auth: {
    username: process.env.NEXTCLOUD_USERNAME,
    password: process.env.NEXTCLOUD_PASSWORD
  }
})

const makeUrl = (...segments) => {
  const config = getConfig()
  const cleaned = segments
    .map((segment) => String(segment || '').trim())
    .filter((segment) => segment !== '')
    .map((segment) => segment.replace(/\/+/g, '/'))
  const joined = posix.join(...cleaned)
  return `${config.baseUrl}${joined.startsWith('/') ? '' : '/'}${joined}`
}

const sanitizeFileName = (filename) => {
  const name = path.basename(filename, path.extname(filename))
  const sanitized = name.replace(/[^a-zA-Z0-9-_\.]/g, '_')
  const ext = path.extname(filename)
  return `${Date.now()}_${sanitized}${ext}`
}

const ensureNextcloudConfig = () => {
  const config = getConfig()
  if (!config.baseUrl || !config.auth.username || !config.auth.password) {
    throw new Error('Nextcloud configuration is not complete')
  }
}

const ensureFolderExists = async (folderPath) => {
  ensureNextcloudConfig()
  const config = getConfig()
  const segments = folderPath.split('/').filter(Boolean)
  let current = ''

  for (const segment of segments) {
    current = `${current}/${segment}`
    const url = makeUrl(config.webdavPath, current)
    try {
      await axios.request({
        method: 'MKCOL',
        url,
        auth: config.auth,
        validateStatus: (status) => status === 201 || status === 405
      })
    } catch (error) {
      console.error('Nextcloud MKCOL failed for', url, error?.response?.status, error?.message)
      throw error
    }
  }
}

const uploadToWebdav = async (targetPath, buffer, mimetype) => {
  ensureNextcloudConfig()
  const config = getConfig()
  const url = makeUrl(config.webdavPath, targetPath)
  try {
    await axios.put(url, buffer, {
      auth: config.auth,
      headers: {
        'Content-Type': mimetype || 'application/octet-stream'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: (status) => status >= 200 && status < 300
    })
    return url
  } catch (error) {
    console.error('Nextcloud PUT failed for', url, error?.response?.status, error?.message)
    throw error
  }
}

const createShareLink = async (targetPath) => {
  ensureNextcloudConfig()
  const config = getConfig()
  const url = makeUrl(config.shareApiPath)
  const params = new URLSearchParams()
  params.append('path', `/${targetPath.replace(/^\//, '')}`)
  params.append('shareType', '3')
  params.append('permissions', '1')

  try {
    const response = await axios.post(url, params.toString(), {
      auth: config.auth,
      headers: {
        'OCS-APIREQUEST': 'true',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      validateStatus: (status) => status >= 200 && status < 300
    })

    const data = response.data
    if (data?.ocs?.meta?.status === 'ok') {
      return data?.ocs?.data?.url || data?.ocs?.data?.token || ''
    }

    throw new Error('Failed to create Nextcloud share link')
  } catch (error) {
    console.error('Nextcloud share link failed for', targetPath, error?.response?.status, error?.message)
    throw error
  }
}

const deleteFromWebdav = async (targetPath) => {
  ensureNextcloudConfig()
  const config = getConfig()
  const url = makeUrl(config.webdavPath, targetPath)
  await axios.delete(url, {
    auth: config.auth,
    validateStatus: (status) => status >= 200 && status < 300
  })
}

const uploadCandidateFile = async (candidateNumber, fieldName, file) => {
  if (!candidateNumber) {
    throw new Error('candidate_number harus diisi untuk upload file')
  }

  if (!file || !file.buffer) {
    return null
  }

  const config = getConfig()
  const folderPath = posix.join(config.uploadDir, candidateNumber, fieldName)
  console.log('Nextcloud upload target', { folderPath, candidateNumber, fieldName, originalname: file.originalname, mimetype: file.mimetype })
  await ensureFolderExists(folderPath)

  const filename = sanitizeFileName(file.originalname || `${fieldName}`)
  const targetPath = posix.join(folderPath, filename)
  console.log('Nextcloud upload path', targetPath)
  await uploadToWebdav(targetPath, file.buffer, file.mimetype)

  try {
    const shareUrl = await createShareLink(targetPath)
    return {
      url: shareUrl || makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  } catch (error) {
    console.error('Nextcloud share fallback used for', targetPath, error?.message)
    return {
      url: makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  }
}

const uploadBackgroundCheckFile = async (candidateId, fieldName, file) => {
  if (!candidateId) {
    throw new Error('candidate_id harus diisi untuk upload background check')
  }

  if (!file || !file.buffer) {
    return null
  }

  const candidate = await candidateRepository.findById(candidateId)
  const candidateNumber = candidate?.candidate_number || candidateId

  if (!candidateNumber) {
    throw new Error('candidate_number tidak ditemukan untuk candidate_id ini')
  }

  const config = getConfig()
  const folderPath = posix.join(config.uploadDir, String(candidateNumber), 'background_checks')
  console.log('Nextcloud background check upload target', {
    folderPath,
    candidateId,
    candidateNumber,
    fieldName,
    originalname: file.originalname,
    mimetype: file.mimetype
  })
  await ensureFolderExists(folderPath)

  const filename = sanitizeFileName(file.originalname || `${fieldName}`)
  const targetPath = posix.join(folderPath, filename)
  console.log('Nextcloud background check upload path', targetPath)
  await uploadToWebdav(targetPath, file.buffer, file.mimetype)

  try {
    const shareUrl = await createShareLink(targetPath)
    return {
      url: shareUrl || makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  } catch (error) {
    console.error('Nextcloud share fallback used for', targetPath, error?.message)
    return {
      url: makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  }
}

const uploadOnBoardDocumentFile = async (candidateId, fieldName, file) => {
  if (!candidateId) {
    throw new Error('candidate_id harus diisi untuk upload on board document')
  }

  if (!file || !file.buffer) {
    return null
  }

  const candidate = await candidateRepository.findById(candidateId)
  const candidateNumber = candidate?.candidate_number || candidateId

  if (!candidateNumber) {
    throw new Error('candidate_number tidak ditemukan untuk candidate_id ini')
  }

  const config = getConfig()
  const folderPath = posix.join(config.uploadDir, String(candidateNumber), 'on_board_documents')
  console.log('Nextcloud on board document upload target', {
    folderPath,
    candidateId,
    candidateNumber,
    fieldName,
    originalname: file.originalname,
    mimetype: file.mimetype
  })
  await ensureFolderExists(folderPath)

  const filename = sanitizeFileName(file.originalname || `${fieldName}`)
  const targetPath = posix.join(folderPath, filename)
  console.log('Nextcloud on board document upload path', targetPath)
  await uploadToWebdav(targetPath, file.buffer, file.mimetype)

  try {
    const shareUrl = await createShareLink(targetPath)
    return {
      url: shareUrl || makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  } catch (error) {
    console.error('Nextcloud share fallback used for', targetPath, error?.message)
    return {
      url: makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  }
}

module.exports = {
  getConfig,
  uploadCandidateFile,
  uploadBackgroundCheckFile,
  uploadOnBoardDocumentFile,
  deleteFromWebdav
}
