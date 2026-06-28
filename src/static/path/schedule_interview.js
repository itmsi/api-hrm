/**
 * Swagger API Path Definitions for Schedule Interview Module
 */

const scheduleInterviewPaths = {
  '/schedule_interview/get': {
    post: {
      tags: ['Schedule Interviews'],
      summary: 'Get schedule interviews list',
      description: 'Retrieve schedule interviews with pagination, search, and sorting',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                search: { type: 'string', example: '' },
                sort_by: { type: 'string', example: 'created_at' },
                sort_order: { type: 'string', example: 'desc' },
                candidate_id: { type: 'string', nullable: true, example: '' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ScheduleInterview' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/schedule_interview/create': {
    post: {
      tags: ['Schedule Interviews'],
      summary: 'Create schedule interview',
      description: 'Create a new schedule interview record',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ScheduleInterviewInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ScheduleInterview' },
                  message: { type: 'string', example: 'Data schedule interview berhasil dibuat' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/schedule_interview/{id}': {
    get: {
      tags: ['Schedule Interviews'],
      summary: 'Get schedule interview by ID',
      description: 'Retrieve a single schedule interview by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule interview UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ScheduleInterview' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Schedule Interviews'],
      summary: 'Update schedule interview',
      description: 'Update an existing schedule interview',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule interview UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ScheduleInterviewInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ScheduleInterview' },
                  message: { type: 'string', example: 'Data schedule interview berhasil diupdate' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Schedule Interviews'],
      summary: 'Delete schedule interview',
      description: 'Soft delete a schedule interview',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Schedule interview UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data schedule interview berhasil dihapus' }
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = scheduleInterviewPaths
