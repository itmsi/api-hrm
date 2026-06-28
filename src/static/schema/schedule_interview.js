const scheduleInterviewSchema = {
  ScheduleInterview: {
    type: 'object',
    properties: {
      schedule_interview_id: { type: 'string', format: 'uuid', example: '3d8a0f70-2d2d-4c2f-86f0-1a4ac0f083ef' },
      candidate_id: { type: 'string', format: 'uuid', nullable: true, example: '71f7d5ce-9fea-4c53-b0d9-f0a8e55b96b9' },
      assign_role: {
        type: 'object',
        nullable: true,
        example: { role: 'hr' }
      },
      schedule_interview_date: { type: 'string', format: 'date', nullable: true, example: '2026-06-30' },
      schedule_interview_time: { type: 'string', nullable: true, example: '10:00:00' },
      schedule_interview_duration: { type: 'string', nullable: true, example: '60m' },
      created_at: { type: 'string', format: 'date-time' },
      created_by: { type: 'string', format: 'uuid', nullable: true },
      updated_at: { type: 'string', format: 'date-time' },
      updated_by: { type: 'string', format: 'uuid', nullable: true },
      deleted_at: { type: 'string', format: 'date-time', nullable: true },
      deleted_by: { type: 'string', format: 'uuid', nullable: true },
      is_delete: { type: 'boolean', example: false }
    }
  },
  ScheduleInterviewInput: {
    type: 'object',
    properties: {
      candidate_id: { type: 'string', format: 'uuid', nullable: true },
      assign_role: {
        type: 'object',
        nullable: true,
        description: 'JSON object for role assignment'
      },
      schedule_interview_date: { type: 'string', format: 'date', nullable: true },
      schedule_interview_time: { type: 'string', nullable: true },
      schedule_interview_duration: { type: 'string', nullable: true }
    }
  }
}

module.exports = scheduleInterviewSchema
