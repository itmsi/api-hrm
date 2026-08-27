const scheduleInterviewService = require('../modules/schedule_interview/service')
const interviewService = require('../modules/interview/service')

const N8N_SYSTEM_USER = { employee_id: '118f54d0-ff22-4185-b0a0-0fd940d9acac' }

const getJakartaDate = () => {
  const now = new Date()
  const dateStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
  const timeStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now)
  return { dateStr, timeStr }
}

const buildSiahDetails = (analysis) => ([
  {
    aspect: 'Sincerity',
    question: analysis.Sincerity_evidence || 'question',
    answer: analysis.Sincerity_evidence || 'remark',
    score: analysis.Sincerity_score || 0
  },
  {
    aspect: 'Trustworthy',
    question: analysis.Integrity_evidence || 'question',
    answer: analysis.Integrity_evidence || 'Remark',
    score: analysis.Integrity_score || 0
  },
  {
    aspect: 'Altruism',
    question: analysis.Altruism_First_evidence || 'question',
    answer: analysis.Altruism_First_evidence || 'Remark',
    score: analysis.Altruism_First_score || 0
  },
  {
    aspect: 'Humble',
    question: analysis.Humble_evidence || 'question',
    answer: analysis.Humble_evidence || 'Remark',
    score: analysis.Humble_score || 0
  }
])

const buildSevenValuesDetails = (analysis) => ([
  {
    aspect: 'Giving Meaning',
    question: analysis.Creating_Meaning_Together_evidence || 'question',
    answer: analysis.Creating_Meaning_Together_evidence || 'remark',
    score: analysis.Creating_Meaning_Together_score || 0
  },
  {
    aspect: 'Love to learn',
    question: analysis.Love_to_Learn_evidence || 'question',
    answer: analysis.Love_to_Learn_evidence || 'remark',
    score: analysis.Love_to_Learn_score || 0
  },
  {
    aspect: 'Happy practice',
    question: analysis.Happy_Practice_evidence || 'question',
    answer: analysis.Happy_Practice_evidence || 'remark',
    score: analysis.Happy_Practice_score || 0
  },
  {
    aspect: 'Like innovation',
    question: analysis.Innovate_with_Curiosity_evidence || 'question',
    answer: analysis.Innovate_with_Curiosity_evidence || 'remark',
    score: analysis.Innovate_with_Curiosity_score || 0
  },
  {
    aspect: 'Happy to share',
    question: analysis.Sharing_with_Happiness_evidence || 'question',
    answer: analysis.Sharing_with_Happiness_evidence || 'remark',
    score: analysis.Sharing_with_Happiness_score || 0
  },
  {
    aspect: 'Embrace failure',
    question: analysis.Embrace_Challenges_Learn_from_Failure_evidence || 'question',
    answer: analysis.Embrace_Challenges_Learn_from_Failure_evidence || 'remark',
    score: analysis.Embrace_Challenges_Learn_from_Failure_score || 0
  },
  {
    aspect: 'Habit of excellence',
    question: analysis.Building_the_Habit_of_Excellence_evidence || 'question',
    answer: analysis.Building_the_Habit_of_Excellence_evidence || 'remark',
    score: analysis.Building_the_Habit_of_Excellence_score || 0
  }
])

const processCandidateInterview = async (candidateId, analysis) => {
  if (!candidateId || !analysis) return null

  const { dateStr, timeStr } = getJakartaDate()

  const scheduleInterview = await scheduleInterviewService.createScheduleInterview(
    {
      candidate_id: candidateId,
      assign_role: { role: 'HR' },
      schedule_interview_date: dateStr,
      schedule_interview_time: timeStr,
      schedule_interview_duration: '60'
    },
    N8N_SYSTEM_USER
  )

  const scheduleInterviewId = scheduleInterview?.schedule_interview_id
  if (!scheduleInterviewId) {
    throw new Error('Failed to retrieve schedule_interview_id from created schedule interview')
  }

  const [siahInterview, sevenValuesInterview] = await Promise.all([
    interviewService.createInterview(
      {
        schedule_interview_id: scheduleInterviewId,
        company_value: 'SIAH',
        comment: 'tidak ada komentar',
        detail_interviews: buildSiahDetails(analysis)
      },
      N8N_SYSTEM_USER
    ),
    interviewService.createInterview(
      {
        schedule_interview_id: scheduleInterviewId,
        company_value: '7 Values',
        comment: 'tidak ada komentar',
        detail_interviews: buildSevenValuesDetails(analysis)
      },
      N8N_SYSTEM_USER
    )
  ])

  return { scheduleInterview, interviews: [siahInterview, sevenValuesInterview] }
}

module.exports = {
  processCandidateInterview
}
