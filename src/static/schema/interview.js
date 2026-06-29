const interviewSchema = {
  Interview: {
    type: 'object',
    properties: {
      interview_id: { type: 'string', format: 'uuid', example: '9f0f2d9a-f77e-4fae-b7b5-a6c8df11f1a7' },
      schedule_interview_id: { type: 'string', format: 'uuid', nullable: true, example: '3d8a0f70-2d2d-4c2f-86f0-1a4ac0f083ef' },
      assigned_id: { type: 'string', format: 'uuid', nullable: true, example: '71f7d5ce-9fea-4c53-b0d9-f0a8e55b96b9' },
      company_value: { type: 'string', nullable: true, example: 'SIAH' },
      comment: { type: 'string', nullable: true, example: 'tidak ada komentar' },
      detail_interviews: {
        type: 'array',
        items: { $ref: '#/components/schemas/DetailInterview' }
      },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', format: 'uuid', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', format: 'uuid', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', format: 'uuid', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  DetailInterview: {
    type: 'object',
    properties: {
      detail_interview_id: { type: 'string', format: 'uuid', example: '55a37b77-f0e2-45f8-9c12-4bfcc9e8b214' },
      interview_id: { type: 'string', format: 'uuid', nullable: true },
      aspect: { type: 'string', nullable: true, example: 'Sincerity' },
      question: { type: 'string', nullable: true, example: 'teset' },
      answer: { type: 'string', nullable: true, example: '' },
      score: { type: 'string', nullable: true, example: '4' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', format: 'uuid', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', format: 'uuid', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', format: 'uuid', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  InterviewInput: {
    type: 'object',
    properties: {
      schedule_interview_id: { type: 'string', format: 'uuid', nullable: true },
      assigned_id: { type: 'string', format: 'uuid', nullable: true },
      company_value: { type: 'string', nullable: true },
      comment: { type: 'string', nullable: true },
      detail_interviews: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            aspect: { type: 'string', nullable: true },
            question: { type: 'string', nullable: true },
            answer: { type: 'string', nullable: true },
            score: { type: 'string', nullable: true }
          }
        }
      }
    }
  }
}

module.exports = interviewSchema
