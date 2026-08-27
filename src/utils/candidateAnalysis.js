const axios = require('axios')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: true })

const getConfig = () => ({
  webhookUrl: process.env.N8N_CANDIDATE_ANALYSIS_WEBHOOK_URL || 'https://n8n-qgvdzxh7jofv.kobalt.sumopod.my.id/webhook/09ae072c-5038-4d59-85a0-892ac060d9d4',
  username: process.env.N8N_USERNAME,
  password: process.env.N8N_PASSWORD
})

const analyzeCandidateResume = async (urlCv) => {
  if (!urlCv) return null

  const config = getConfig()
  const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`

  try {
    const response = await axios.post(
      config.webhookUrl,
      { url_cv: urlCv },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        }
      }
    )

    const data = response.data
    if (Array.isArray(data) && data.length > 0 && data[0]?.output) {
      return data[0].output
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return data
    }

    console.error('Candidate resume analysis returned an unexpected shape for', urlCv, data)
    return null
  } catch (error) {
    console.error('Candidate resume analysis failed for', urlCv, error?.response?.status, error?.message)
    throw error
  }
}

module.exports = {
  analyzeCandidateResume
}
