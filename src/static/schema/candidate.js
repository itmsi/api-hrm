/**
 * Swagger Schema Definitions for Candidate Module
 */

const candidateSchemas = {
  Candidate: {
    type: 'object',
    properties: {
      candidate_id: {
        type: 'string',
        format: 'uuid',
        description: 'Candidate UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      company_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Company UUID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      department_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Department UUID',
        example: '123e4567-e89b-12d3-a456-426614174002'
      },
      title_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Title UUID',
        example: '123e4567-e89b-12d3-a456-426614174003'
      },
      candidate_number: {
        type: 'string',
        nullable: true,
        description: 'Candidate number',
        example: 'CN-0001'
      },
      candidate_name: {
        type: 'string',
        nullable: true,
        description: 'Candidate full name',
        example: 'John Doe'
      },
      candidate_email: {
        type: 'string',
        nullable: true,
        description: 'Candidate email address',
        example: 'john.doe@example.com'
      },
      candidate_phone: {
        type: 'string',
        nullable: true,
        description: 'Candidate phone number',
        example: '+6281234567890'
      },
      candidate_religion: {
        type: 'string',
        nullable: true,
        description: 'Candidate religion',
        example: 'Islam'
      },
      candidate_gender: {
        type: 'string',
        nullable: true,
        description: 'Candidate gender',
        example: 'male'
      },
      candidate_marital_status: {
        type: 'string',
        nullable: true,
        description: 'Candidate marital status',
        example: 'single'
      },
      candidate_age: {
        type: 'integer',
        nullable: true,
        description: 'Candidate age',
        example: 30
      },
      candidate_date_birth: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'Candidate birth date',
        example: '1995-01-01'
      },
      candidate_nationality: {
        type: 'string',
        nullable: true,
        description: 'Candidate nationality',
        example: 'Indonesia'
      },
      candidate_city: {
        type: 'string',
        nullable: true,
        description: 'Candidate city',
        example: 'Jakarta'
      },
      candidate_state: {
        type: 'string',
        nullable: true,
        description: 'Candidate state',
        example: 'DKI Jakarta'
      },
      candidate_country: {
        type: 'string',
        nullable: true,
        description: 'Candidate country',
        example: 'Indonesia'
      },
      candidate_address: {
        type: 'string',
        nullable: true,
        description: 'Candidate address',
        example: 'Jl. Sudirman No. 1'
      },
      candidate_foto: {
        type: 'string',
        nullable: true,
        description: 'Candidate photo URL',
        example: 'https://example.com/photos/john-doe.jpg'
      },
      candidate_resume: {
        type: 'string',
        nullable: true,
        description: 'Candidate resume URL or file path',
        example: 'https://example.com/resumes/john-doe.pdf'
      },
      candidate_foto_path: {
        type: 'string',
        nullable: true,
        description: 'Stored Nextcloud path for candidate photo',
        example: '/HRM/CN-0001/candidate_foto/1710000000000_photo.jpg'
      },
      candidate_resume_path: {
        type: 'string',
        nullable: true,
        description: 'Stored Nextcloud path for candidate resume',
        example: '/HRM/CN-0001/candidate_resume/1710000000000_resume.pdf'
      },
      schedule_interview: {
        type: 'object',
        nullable: true,
        description: 'Interview schedule details',
        properties: {
          assign_role: { type: 'string', nullable: true, example: 'interviewer' },
          schedule_interview_date: { type: 'string', format: 'date', nullable: true, example: '2026-06-28' },
          schedule_interview_time: { type: 'string', nullable: true, example: '10:00' },
          schedule_interview_duration: { type: 'string', nullable: true, example: '60m' }
        }
      },
      ptk_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'PTK date',
        example: '2026-06-28'
      },
      offering_letter: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'Offering letter date',
        example: '2026-06-28'
      },
      remark: {
        type: 'string',
        nullable: true,
        description: 'Candidate remark',
        example: 'Candidate available for immediate hire'
      },
      group_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Candidate group UUID',
        example: '123e4567-e89b-12d3-a456-426614174020'
      },
      candidate_status: {
        type: 'string',
        nullable: true,
        description: 'Candidate status',
        example: 'active'
      },
      candidate_status_offering_letter: {
        type: 'string',
        nullable: true,
        description: 'Candidate status offering letter',
        example: 'approved'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Record creation timestamp',
        example: '2026-06-27T10:00:00.000Z'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Created by user UUID',
        example: '123e4567-e89b-12d3-a456-426614174010'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Record update timestamp',
        example: '2026-06-27T10:00:00.000Z'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Updated by user UUID',
        example: '123e4567-e89b-12d3-a456-426614174010'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Soft delete timestamp',
        example: null
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Deleted by user UUID',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      }
    }
  },
  CandidateMultipartInput: {
    type: 'object',
    properties: {
      company_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      department_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      title_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      candidate_number: {
        type: 'string',
        nullable: true
      },
      candidate_name: {
        type: 'string',
        nullable: true
      },
      candidate_email: {
        type: 'string',
        format: 'email',
        nullable: true
      },
      candidate_phone: {
        type: 'string',
        nullable: true
      },
      candidate_religion: {
        type: 'string',
        nullable: true
      },
      candidate_gender: {
        type: 'string',
        nullable: true
      },
      candidate_marital_status: {
        type: 'string',
        nullable: true
      },
      candidate_age: {
        type: 'integer',
        nullable: true
      },
      candidate_date_birth: {
        type: 'string',
        format: 'date',
        nullable: true
      },
      candidate_nationality: {
        type: 'string',
        nullable: true
      },
      candidate_city: {
        type: 'string',
        nullable: true
      },
      candidate_state: {
        type: 'string',
        nullable: true
      },
      candidate_country: {
        type: 'string',
        nullable: true
      },
      candidate_address: {
        type: 'string',
        nullable: true
      },
      candidate_foto: {
        type: 'string',
        format: 'binary',
        nullable: true,
        description: 'Candidate photo upload file'
      },
      candidate_resume: {
        type: 'string',
        format: 'binary',
        nullable: true,
        description: 'Candidate resume upload file'
      },
      candidate_foto_is_delete: {
        type: 'boolean',
        nullable: true,
        description: 'Set to true to delete the existing candidate photo from Nextcloud and clear DB values'
      },
      candidate_resume_is_delete: {
        type: 'boolean',
        nullable: true,
        description: 'Set to true to delete the existing candidate resume from Nextcloud and clear DB values'
      },
      schedule_interview: {
        type: 'string',
        nullable: true,
        description: 'JSON string for interview schedule details'
      },
      ptk_date: {
        type: 'string',
        format: 'date',
        nullable: true
      },
      offering_letter: {
        type: 'string',
        format: 'date',
        nullable: true
      },
      remark: {
        type: 'string',
        nullable: true
      },
      group_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      candidate_status: {
        type: 'string',
        nullable: true
      },
      candidate_status_offering_letter: {
        type: 'string',
        nullable: true
      },
      is_delete: {
        type: 'boolean',
        nullable: true
      }
    }
  },
  CandidateInput: {
    type: 'object',
    properties: {
      company_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      department_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      title_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      candidate_number: {
        type: 'string',
        nullable: true
      },
      candidate_name: {
        type: 'string',
        nullable: true
      },
      candidate_email: {
        type: 'string',
        format: 'email',
        nullable: true
      },
      candidate_phone: {
        type: 'string',
        nullable: true
      },
      candidate_religion: {
        type: 'string',
        nullable: true
      },
      candidate_gender: {
        type: 'string',
        nullable: true
      },
      candidate_marital_status: {
        type: 'string',
        nullable: true
      },
      candidate_age: {
        type: 'integer',
        nullable: true
      },
      candidate_date_birth: {
        type: 'string',
        format: 'date',
        nullable: true
      },
      candidate_nationality: {
        type: 'string',
        nullable: true
      },
      candidate_city: {
        type: 'string',
        nullable: true
      },
      candidate_state: {
        type: 'string',
        nullable: true
      },
      candidate_country: {
        type: 'string',
        nullable: true
      },
      candidate_address: {
        type: 'string',
        nullable: true
      },
      candidate_foto: {
        type: 'string',
        nullable: true
      },
      candidate_resume: {
        type: 'string',
        nullable: true
      },
      candidate_foto_is_delete: {
        type: 'boolean',
        nullable: true
      },
      candidate_resume_is_delete: {
        type: 'boolean',
        nullable: true
      },
      schedule_interview: {
        type: 'object',
        nullable: true,
        properties: {
          assign_role: { type: 'string', nullable: true },
          schedule_interview_date: { type: 'string', format: 'date', nullable: true },
          schedule_interview_time: { type: 'string', nullable: true },
          schedule_interview_duration: { type: 'string', nullable: true }
        }
      },
      ptk_date: {
        type: 'string',
        format: 'date',
        nullable: true
      },
      offering_letter: {
        type: 'string',
        format: 'date',
        nullable: true
      },
      remark: {
        type: 'string',
        nullable: true
      },
      group_id: {
        type: 'string',
        format: 'uuid',
        nullable: true
      },
      candidate_status: {
        type: 'string',
        nullable: true
      },
      candidate_status_offering_letter: {
        type: 'string',
        nullable: true
      },
      is_delete: {
        type: 'boolean',
        nullable: true
      }
    }
  }
}

module.exports = candidateSchemas
