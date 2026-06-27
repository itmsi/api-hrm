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

// Import paths
// Tambahkan path module Anda di sini
const candidatePaths = require('./path/candidate');

// Combine all schemas
const schemas = {
  ...candidateSchema,
  // ...yourModuleSchema,
};

// Combine all paths
const paths = {
  ...candidatePaths,
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
