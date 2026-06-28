const test = require('node:test')
const assert = require('node:assert/strict')

const { normalizeScheduleInterviewFormData } = require('../src/modules/schedule_interview/validation')

test('normalizeScheduleInterviewFormData parses assign_role JSON and removes blank values', () => {
  const req = {
    body: {
      candidate_id: '   ',
      assign_role: '{"role":"hr"}',
      schedule_interview_date: '',
      schedule_interview_time: '  ',
      schedule_interview_duration: '60m'
    }
  }

  const res = {}
  const next = () => {
    assert.ok(true)
  }

  normalizeScheduleInterviewFormData(req, res, next)

  assert.equal(req.body.candidate_id, undefined)
  assert.deepEqual(req.body.assign_role, { role: 'hr' })
  assert.equal(req.body.schedule_interview_date, undefined)
  assert.equal(req.body.schedule_interview_time, undefined)
  assert.equal(req.body.schedule_interview_duration, '60m')
})
