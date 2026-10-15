import type { QuestionBank } from '../../question-bank/domain'
import type { LearnerSnapshot } from './learner-state'

// These scopes were replaced by the fourteen sections of the study notes.
// Their cursors cannot describe a pass through the new groups. Answer history
// remains keyed by question ID and supplies the recalculated progress.
const retiredGroups = new Set([
  'constitution-rights',
  'federalism-state-symbols',
  'government-institutions',
  'elections-participation',
  'justice-legal-system',
  'economy-social-security',
  'jewish-life-nazi-history',
  'postwar-ddr-reunification',
  'family-education',
  'everyday-administration',
  'equality-religion-migration',
])

export const migrateStudyGroups = (
  snapshot: LearnerSnapshot,
  bank: QuestionBank,
): LearnerSnapshot => ({
  ...snapshot,
  positions: {
    ...snapshot.positions,
    groups: Object.fromEntries(
      Object.entries(snapshot.positions.groups).filter(([group, position]) => {
        if (position !== undefined && !bank.questions.some((q) => q.id === position.questionKey)) {
          throw new Error(`Unknown question ${position.questionKey} in the question bank.`)
        }

        return !retiredGroups.has(group)
      }),
    ),
  },
})
