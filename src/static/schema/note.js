const noteSchema = {
  Note: {
    type: 'object',
    properties: {
      note_id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      candidate_id: { type: 'string', format: 'uuid', nullable: true, example: '71f7d5ce-9fea-4c53-b0d9-f0a8e55b96b9' },
      notes: { type: 'string', nullable: true, example: 'Catatan kandidat' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', format: 'uuid', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', format: 'uuid', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', format: 'uuid', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  NoteInput: {
    type: 'object',
    properties: {
      candidate_id: { type: 'string', format: 'uuid', nullable: true },
      notes: { type: 'string', nullable: true }
    }
  }
}

module.exports = noteSchema
