import type { LearnerSnapshot } from '../../../web/src/modules/learner-state/domain/learner-state'
import bank from '../../../web/public/questionbank-berlin.json' with { type: 'json' }

// These fixtures characterize the named rejection cases. They do not approve the importer's
// broader policies: depth 8, 64 object entries, 64 characters for every string/key, or
// 50,000 entries for every array. Those implementation limits need a separate owner decision.
export const backupWithProblem = (snapshot: LearnerSnapshot, problem: string, now: number) => {
  const attempt = snapshot.studyAttempts[0]

  if (attempt === undefined) {
    throw new Error('Record a study answer before preparing a backup fixture.')
  }
  const tomorrow = now + 24 * 60 * 60 * 1000

  const sitting = {
    id: 'fixture-mock',
    startedAt: now,
    deadline: now + 60 * 60 * 1000,
    currentQuestion: 0,
    answers: [
      ...bank.questions.filter((question) => question.section === 'general').slice(0, 30),
      ...bank.questions.filter((question) => question.section === 'berlin').slice(0, 3),
    ].map((question) => ({ questionKey: question.id, selectedOption: null })),
    status: 'unfinished',
    endedAt: now,
  }

  switch (problem) {
    case 'an identifier longer than 64':
      return JSON.stringify({ ...snapshot, studyAttempts: [{ ...attempt, id: 'a'.repeat(65) }] })
    case 'more than 50000 study attempts':
      return JSON.stringify({
        ...snapshot,
        studyAttempts: Array.from({ length: 50_001 }, (_, index) => ({
          ...attempt,
          id: `${index}`,
        })),
      })
    case 'more than 1000 mock tests':
      return JSON.stringify({
        ...snapshot,
        mockSittings: Array.from({ length: 1_001 }, (_, index) => ({ ...sitting, id: `${index}` })),
      })
    case 'deeply nested unused data':
      // Characterize rejection of extreme nesting without prescribing an accepted depth limit.
      return `${JSON.stringify(snapshot).slice(0, -1)},"unused":${'['.repeat(20_000)}0${']'.repeat(20_000)}}`
    case 'oversized UTF-8 text':
      // Fewer than 10 MiB UTF-16 code units, but more than 10 MiB encoded bytes.
      // The scenario checks size rejection specifically: this text also exceeds structural limits.
      return `${JSON.stringify(snapshot).slice(0, -1)},"unused":"${'€'.repeat(4 * 1024 * 1024)}"}`
    case 'the maximum date timestamp':
      return JSON.stringify({ ...snapshot, studyAttempts: [{ ...attempt, answeredAt: 8.64e15 }] })
    case 'a study timestamp beyond a day':
      return JSON.stringify({
        ...snapshot,
        studyAttempts: [{ ...attempt, answeredAt: tomorrow + 1 }],
      })
    case 'a mock start beyond a day':
      return JSON.stringify({
        ...snapshot,
        mockSittings: [
          {
            id: sitting.id,
            startedAt: tomorrow + 1,
            deadline: tomorrow + 3_600_001,
            currentQuestion: sitting.currentQuestion,
            answers: sitting.answers,
            status: 'active',
          },
        ],
      })
    case 'a mock finish beyond a day':
      return JSON.stringify({ ...snapshot, mockSittings: [{ ...sitting, endedAt: tomorrow + 1 }] })
    default:
      throw new Error(`Unknown backup fixture: ${problem}`)
  }
}
