const info = {
  description: 'Express.js API Boilerplate - Template untuk pengembangan REST API dengan fitur lengkap',
  version: '1.0.0',
  title: 'Express.js API HRM Documentation',
  contact: {
    email: 'your-email@example.com'
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  }
}

const servers = [
  {
    url: '/api/hrm',
    description: 'Development server'
  },
    {
    url: 'https://gateway.motorsights.com/api/hrm',
    description: 'Production server'
  },
  {
    url: 'https://dev-gateway.motorsights.com/api/hrm',
    description: 'Develop server'
  }
]

// Import schemas
// Tambahkan schema module Anda di sini
const candidateSchema = require('./schema/candidate');
const scheduleInterviewSchema = require('./schema/schedule_interview');
const interviewSchema = require('./schema/interview');
const backgroundCheckSchema = require('./schema/background_check');
const onBoardDocumentSchema = require('./schema/on_board_document');

// Import paths
// Tambahkan path module Anda di sini
const candidatePaths = require('./path/candidate');
const scheduleInterviewPaths = require('./path/schedule_interview');
const interviewPaths = require('./path/interview');
const backgroundCheckPaths = require('./path/background_check');
const onBoardDocumentPaths = require('./path/on_board_document');

// Combine all schemas
const schemas = {
  ...candidateSchema,
  ...scheduleInterviewSchema,
  ...interviewSchema,
  ...backgroundCheckSchema,
  ...onBoardDocumentSchema,
  // ...yourModuleSchema,
};

// Combine all paths
const paths = {
  ...candidatePaths,
  ...scheduleInterviewPaths,
  ...interviewPaths,
  ...backgroundCheckPaths,
  ...onBoardDocumentPaths,
  // ...yourModulePaths,
};

const index = {
  openapi: '3.0.0',
  info,
  servers,
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas
  }
}

module.exports = {
  index
}
