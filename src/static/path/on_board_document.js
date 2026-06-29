/**
 * Swagger API Path Definitions for On Board Document Module
 */

const onBoardDocumentPaths = {
  '/on_board_document/get': {
    post: {
      tags: ['On Board Documents'],
      summary: 'Get on board documents list',
      description: 'Retrieve on board documents with pagination, search, and sorting',
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
                        items: { $ref: '#/components/schemas/OnBoardDocument' }
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
  '/on_board_document/create': {
    post: {
      tags: ['On Board Documents'],
      summary: 'Create on board document',
      description: 'Create a new on board document record',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/OnBoardDocumentInput' }
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
                  data: { $ref: '#/components/schemas/OnBoardDocument' },
                  message: { type: 'string', example: 'Data on board document berhasil dibuat' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/on_board_document/{id}': {
    get: {
      tags: ['On Board Documents'],
      summary: 'Get on board document by ID',
      description: 'Retrieve a single on board document by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'On board document UUID',
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
                  data: { $ref: '#/components/schemas/OnBoardDocument' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['On Board Documents'],
      summary: 'Update on board document',
      description: 'Update an existing on board document',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'On board document UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/OnBoardDocumentInput' }
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
                  data: { $ref: '#/components/schemas/OnBoardDocument' },
                  message: { type: 'string', example: 'Data on board document berhasil diupdate' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['On Board Documents'],
      summary: 'Delete on board document',
      description: 'Soft delete an on board document',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'On board document UUID',
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
                  message: { type: 'string', example: 'Data on board document berhasil dihapus' }
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = onBoardDocumentPaths
