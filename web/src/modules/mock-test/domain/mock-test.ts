import type { MockSitting } from '../../learner-state/domain'

export const getRemainingSeconds = (sitting: MockSitting, now: number): number =>
  Math.max(0, Math.ceil((sitting.deadline - now) / 1000))

export const finalizeMockSitting = (
  sitting: MockSitting,
  status: 'completed' | 'unfinished',
  now: number,
  endedAt: number,
): MockSitting => {
  if (sitting.status !== 'active') {
    return sitting
  }
  const hasExpired = now >= sitting.deadline
  const finished = { ...sitting, endedAt: Math.max(endedAt, sitting.startedAt) }

  return hasExpired || status === 'completed'
    ? { ...finished, status: 'completed', finishReason: hasExpired ? 'timeout' : 'submitted' }
    : { ...finished, status: 'unfinished' }
}

export const getMockFinishReason = (sitting: MockSitting) => {
  if (sitting.status !== 'completed') {
    return null
  }

  return sitting.finishReason
}
