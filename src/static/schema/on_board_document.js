const onBoardDocumentSchema = {
  OnBoardDocument: {
    type: 'object',
    properties: {
      on_board_documents_id: { type: 'string', format: 'uuid', example: '6f6c4d1d-4b90-41b8-90c5-6d2336f3f2a1' },
      candidate_id: { type: 'string', format: 'uuid', nullable: true, example: '71f7d5ce-9fea-4c53-b0d9-f0a8e55b96b9' },
      on_board_documents_name: { type: 'string', nullable: true, example: 'Contract Document' },
      on_board_documents_file: { type: 'string', nullable: true, example: 'https://nextcloud.example.com/s/share-link' },
      on_board_documents_file_path: { type: 'string', nullable: true, example: '/HRM/12345/on_board_documents/123_test.pdf' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', format: 'uuid', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', format: 'uuid', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', format: 'uuid', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  OnBoardDocumentInput: {
    type: 'object',
    properties: {
      candidate_id: { type: 'string', format: 'uuid', nullable: true },
      on_board_documents_name: { type: 'string', nullable: true },
      on_board_documents_file: { type: 'string', format: 'binary', description: 'Upload file as multipart/form-data' },
      on_board_documents_file_path: { type: 'string', nullable: true, description: 'Internal Nextcloud path (filled automatically)' }
    }
  }
}

module.exports = onBoardDocumentSchema
