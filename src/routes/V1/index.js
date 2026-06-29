const express = require('express')
// const { verifyToken } = require('../../middlewares')

const routing = express();
const API_TAG = '/api';

/* RULE
naming convention endpoint: using plural
Example:
- GET /api/examples
- POST /api/examples
- GET /api/examples/:id
- PUT /api/examples/:id
- DELETE /api/examples/:id
*/

// Example Module (Template untuk module Anda)
const exampleModule = require('../../modules/example')
routing.use(`${API_TAG}/examples`, exampleModule)

// Candidate Module
const candidateModule = require('../../modules/candidate')
routing.use(`${API_TAG}/hrm/candidates`, candidateModule)

// Schedule Interview Module
const scheduleInterviewModule = require('../../modules/schedule_interview')
routing.use(`${API_TAG}/hrm/schedule_interview`, scheduleInterviewModule)

// Interview Module
const interviewModule = require('../../modules/interview')
routing.use(`${API_TAG}/hrm/interviews`, interviewModule)

// Background Check Module
const backgroundCheckModule = require('../../modules/background_check')
routing.use(`${API_TAG}/hrm/background_check`, backgroundCheckModule)

// On Board Document Module
const onBoardDocumentModule = require('../../modules/on_board_document')
routing.use(`${API_TAG}/hrm/on_board_document`, onBoardDocumentModule)

// Note Module
const noteModule = require('../../modules/note')
routing.use(`${API_TAG}/hrm/note`, noteModule)

// Tambahkan routes module Anda di sini
// Example:
// const yourModule = require('../../modules/yourModule')
// routing.use(`${API_TAG}/your-endpoint`, yourModule)

module.exports = routing;
