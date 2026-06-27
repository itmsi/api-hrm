/**
 * Swagger API Path Definitions for Candidate Module
 */

const candidatePaths = {
  '/hrm/candidates/get': {
    post: {
      tags: ['Candidates'],
      summary: 'Get candidates list',
      description: 'Retrieve candidates with pagination, search, and sorting',
      security: [
        {
          bearerAuth: []
        }
      ],
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
                sort_order: { type: 'string', example: 'desc' }
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
                        items: { $ref: '#/components/schemas/Candidate' }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          totalPages: { type: 'integer' },
                          hasNextPage: { type: 'boolean' },
                          hasPrevPage: { type: 'boolean' },
                          nextPage: { type: 'integer', nullable: true },
                          prevPage: { type: 'integer', nullable: true }
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
  '/hrm/candidates/create': {
    post: {
      tags: ['Candidates'],
      summary: 'Create new candidate',
      description: 'Create a new candidate record',
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CandidateInput' }
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
                  data: { $ref: '#/components/schemas/Candidate' },
                  message: { type: 'string', example: 'Data kandidat berhasil dibuat' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/hrm/candidates/{id}': {
    get: {
      tags: ['Candidates'],
      summary: 'Get candidate by ID',
      description: 'Retrieve single candidate by ID',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Candidate UUID',
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
                  data: { $ref: '#/components/schemas/Candidate' }
                }
              }
            }
          }
        },
        404: {
          description: 'Candidate not found'
        }
      }
    },
    put: {
      tags: ['Candidates'],
      summary: 'Update candidate',
      description: 'Update a candidate by ID',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Candidate UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CandidateInput' }
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
                  data: { $ref: '#/components/schemas/Candidate' },
                  message: { type: 'string', example: 'Data kandidat berhasil diupdate' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Candidates'],
      summary: 'Delete candidate',
      description: 'Soft delete candidate by ID',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Candidate UUID',
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
                  message: { type: 'string', example: 'Data kandidat berhasil dihapus' }
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = candidatePaths
