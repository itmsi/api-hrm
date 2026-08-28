const repository = require('./repository')
const { pgCore } = require('../../config/database')
const { parseCsvBuffer, cleanCsvValue } = require('../../utils/csvImport')

const getRequesterId = (user) => {
  if (!user) return null
  return user.employee_id || user.user_id || user.users_id || user.sub || null
}

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'nan') return null
  return trimmed
}

const getNotes = async (params) => {
  return await repository.findAll(params)
}

const getNoteById = async (id) => {
  const data = await repository.findById(id)
  if (!data) {
    throw { message: 'Data note tidak ditemukan', statusCode: 404 }
  }
  return data
}

const createNote = async (payload, user) => {
  const authorId = getRequesterId(user)
  return await repository.create({
    candidate_id: normalizeOptionalString(payload?.candidate_id),
    notes: normalizeOptionalString(payload?.notes),
    created_by: authorId,
    updated_by: authorId
  })
}

const updateNote = async (id, payload, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data note tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.update(id, {
    candidate_id: normalizeOptionalString(payload?.candidate_id),
    notes: normalizeOptionalString(payload?.notes),
    updated_by: authorId
  })
}

const deleteNote = async (id, user) => {
  const existing = await repository.findById(id)
  if (!existing) {
    throw { message: 'Data note tidak ditemukan', statusCode: 404 }
  }
  const authorId = getRequesterId(user)
  return await repository.remove(id, authorId)
}

const buildNoteImportPayload = (row) => {
  const noteId = cleanCsvValue(row.note_id)
  if (!noteId) {
    throw new Error('note_id wajib diisi')
  }

  const candidateId = cleanCsvValue(row.candidate_id)
  if (!candidateId) {
    throw new Error('candidate_id wajib diisi')
  }

  return {
    note_id: noteId,
    candidate_id: candidateId,
    notes: cleanCsvValue(row.notes)
  }
}

const importNotesFromCsv = async (fileBuffer) => {
  if (!fileBuffer) {
    throw { message: 'File CSV wajib diunggah', statusCode: 400 }
  }

  const rows = await parseCsvBuffer(fileBuffer)

  if (rows.length === 0) {
    throw { message: 'File CSV kosong atau format tidak sesuai', statusCode: 400 }
  }

  const summary = { total_rows: rows.length, created: 0, updated: 0, failed: 0, errors: [] }

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const rowNumber = index + 2

    try {
      const payload = buildNoteImportPayload(row)
      const existing = await repository.findRawById(payload.note_id)

      if (existing) {
        await repository.updateRaw(payload.note_id, {
          ...payload,
          updated_at: pgCore.fn.now()
        })
        summary.updated++
      } else {
        await repository.insertRaw({
          ...payload,
          created_at: pgCore.fn.now(),
          updated_at: pgCore.fn.now(),
          is_delete: false
        })
        summary.created++
      }
    } catch (error) {
      summary.failed++
      summary.errors.push({ row: rowNumber, message: error.message || 'Gagal memproses baris' })
    }
  }

  return summary
}

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  importNotesFromCsv
}
