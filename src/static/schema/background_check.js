const backgroundCheckSchema = {
  BackgroundCheck: {
    type: 'object',
    properties: {
      background_check_id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      candidate_id: { type: 'string', format: 'uuid', nullable: true, example: '71f7d5ce-9fea-4c53-b0d9-f0a8e55b96b9' },
      background_check_note: { type: 'string', nullable: true, example: 'Catatan check' },
      file_attachment: { type: 'string', nullable: true, example: 'https://nextcloud.example.com/s/share-link' },
      file_attachment_path: { type: 'string', nullable: true, example: '/HRM/background_check/file_attachment/123_test.pdf' },
      background_check_status: { type: 'string', nullable: true, example: 'pending' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', format: 'uuid', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', format: 'uuid', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', format: 'uuid', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  BackgroundCheckInput: {
    type: 'object',
    properties: {
      candidate_id: { type: 'string', format: 'uuid', nullable: true },
      background_check_note: { type: 'string', nullable: true },
      file_attachment: { type: 'string', format: 'binary', description: 'Upload file_attachment as multipart/form-data' },
      file_attachment_path: { type: 'string', nullable: true, description: 'Internal Nextcloud path (filled automatically)' },
      background_check_status: { type: 'string', nullable: true }
    }
  }
}

module.exports = backgroundCheckSchema
