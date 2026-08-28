const csvParser = require('csv-parser')
const { Readable } = require('stream')

const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const rows = []
    Readable.from(buffer.toString('utf8'))
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

const cleanCsvValue = (value) => {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'nan') return null
  return trimmed
}

const cleanCsvDigits = (value) => {
  const cleaned = cleanCsvValue(value)
  if (!cleaned) return null
  const digits = cleaned.replace(/[^0-9]/g, '')
  return digits === '' ? null : parseInt(digits, 10)
}

module.exports = {
  parseCsvBuffer,
  cleanCsvValue,
  cleanCsvDigits
}
