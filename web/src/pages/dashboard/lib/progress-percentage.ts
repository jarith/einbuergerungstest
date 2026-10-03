import type { QuestionTotals } from '../../../modules/learner-state'

export const getProgressPercentage = ({
  contributing,
  total,
}: Pick<QuestionTotals, 'contributing' | 'total'>) => {
  const value = total === 0 ? 0 : Math.round((contributing / total) * 100)

  return { value, fractionDigits: 0 }
}
