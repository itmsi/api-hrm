const axios = require('axios')
const path = require('path')

const posix = path.posix

const config = {
  baseUrl: (process.env.NEXTCLOUD_URL || '').replace(/\/+$|^\s+|\s+$/g, ''),
  webdavPath: (process.env.NEXTCLOUD_WEBDAV_PATH || '/remote.php/webdav').replace(/\/+$|^\s+|\s+$/g, ''),
  shareApiPath: (process.env.NEXTCLOUD_SHARE_API_PATH || '/ocs/v1.php/apps/files_sharing/api/v1/shares').replace(/\/+$|^\s+|\s+$/g, ''),
  uploadDir: (process.env.NEXTCLOUD_UPLOAD_DIR || '/HRM').replace(/\/+$|^\s+|\s+$/g, ''),
  auth: {
    username: process.env.NEXTCLOUD_USERNAME,
    password: process.env.NEXTCLOUD_PASSWORD
  }
}

const makeUrl = (...segments) => {
  const cleaned = segments
    .map((segment) => String(segment || '').trim())
    .filter((segment) => segment !== '')
    .map((segment) => segment.replace(/\/+/g, '/'))
  const joined = posix.join(...cleaned)
  return `${config.baseUrl.replace(/\/+$|^\s+|\s+$/g, '')}${joined.startsWith('/') ? '' : '/'}${joined}`
}

const sanitizeFileName = (filename) => {
  const name = path.basename(filename, path.extname(filename))
  const sanitized = name.replace(/[^a-zA-Z0-9-_\.]/g, '_')
  const ext = path.extname(filename)
  return `${Date.now()}_${sanitized}${ext}`
}

const ensureNextcloudConfig = () => {
  if (!config.baseUrl || !config.auth.username || !config.auth.password) {
    throw new Error('Nextcloud configuration is not complete')
  }
}

const ensureFolderExists = async (folderPath) => {
  ensureNextcloudConfig()
  const segments = folderPath.split('/').filter(Boolean)
  let current = ''

  for (const segment of segments) {
    current = `${current}/${segment}`
    const url = makeUrl(config.webdavPath, current)
    await axios.request({
      method: 'MKCOL',
      url,
      auth: config.auth,
      validateStatus: (status) => status === 201 || status === 405
    })
  }
}

const uploadToWebdav = async (targetPath, buffer, mimetype) => {
  ensureNextcloudConfig()
  const url = makeUrl(config.webdavPath, targetPath)
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
}

const createShareLink = async (targetPath) => {
  ensureNextcloudConfig()
  const url = makeUrl(config.shareApiPath)
  const params = new URLSearchParams()
  params.append('path', `/${targetPath.replace(/^\//, '')}`)
  params.append('shareType', '3')
  params.append('permissions', '1')

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
}

const deleteFromWebdav = async (targetPath) => {
  ensureNextcloudConfig()
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

  const folderPath = posix.join(config.uploadDir, candidateNumber, fieldName)
  await ensureFolderExists(folderPath)

  const filename = sanitizeFileName(file.originalname || `${fieldName}`)
  const targetPath = posix.join(folderPath, filename)
  await uploadToWebdav(targetPath, file.buffer, file.mimetype)

  try {
    const shareUrl = await createShareLink(targetPath)
    return {
      url: shareUrl || makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  } catch (error) {
    return {
      url: makeUrl(config.webdavPath, targetPath),
      path: targetPath
    }
  }
}

module.exports = {
  uploadCandidateFile,
  deleteFromWebdav
}
