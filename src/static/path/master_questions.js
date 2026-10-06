/**
 * Swagger API Path Definitions for Master Questions Module
 */

// Module ini berada di bawah /api/career, bukan /api/hrm (server default)
const careerServers = [
  { url: '/api/career', description: 'Development server' },
  { url: 'https://gateway.motorsights.com/api/career', description: 'Production server' },
  { url: 'https://dev-gateway.motorsights.com/api/career', description: 'Develop server' }
]

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Master Question UUID',
  schema: { type: 'string', format: 'uuid' }
}

const masterQuestionsPaths = {
  '/master_questions/get': {
    servers: careerServers,
    post: {
      tags: ['Master Questions'],
      summary: 'Get master questions list',
      description: 'Retrieve master questions with pagination, search, and sorting',
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
                sort_by: { type: 'string', enum: ['created_at', 'updated_at', 'focus_assessment'], example: 'created_at' },
                sort_order: { type: 'string', enum: ['asc', 'desc'], example: 'desc' }
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
                        items: { $ref: '#/components/schemas/MasterQuestion' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' }
                        }
                      }
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
  '/master_questions/create': {
    servers: careerServers,
    post: {
      tags: ['Master Questions'],
      summary: 'Create master question',
      description: 'Create a new master question record',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MasterQuestionInput' }
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
                  data: { $ref: '#/components/schemas/MasterQuestion' },
                  message: { type: 'string', example: 'Data master question berhasil dibuat' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/master_questions/{id}': {
    servers: careerServers,
    get: {
      tags: ['Master Questions'],
      summary: 'Get master question by ID',
      description: 'Retrieve a single master question by ID',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/MasterQuestion' }
                }
              }
            }
          }
        },
        404: { description: 'Data master question tidak ditemukan' }
      }
    },
    put: {
      tags: ['Master Questions'],
      summary: 'Update master question',
      description: 'Update an existing master question',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MasterQuestionInput' }
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
                  data: { $ref: '#/components/schemas/MasterQuestion' },
                  message: { type: 'string', example: 'Data master question berhasil diupdate' }
                }
              }
            }
          }
        },
        404: { description: 'Data master question tidak ditemukan' }
      }
    },
    delete: {
      tags: ['Master Questions'],
      summary: 'Delete master question',
      description: 'Soft delete a master question',
      security: [{ bearerAuth: [] }],
      parameters: [idParameter],
      responses: {
        200: {
          description: 'Deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data master question berhasil dihapus' }
                }
              }
            }
          }
        },
        404: { description: 'Data master question tidak ditemukan' }
      }
    }
  }
}

module.exports = masterQuestionsPaths
