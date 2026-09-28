/** A stale learner model must reload before it can safely write again. */
export const createLearnerStateConflictError = () =>
  Object.assign(
    new Error('Learner data changed in another app window. Reload before making more changes.'),
    { name: 'LearnerStateConflictError' },
  )

export const isLearnerStateConflict = (error: Error | undefined) =>
  error?.name === 'LearnerStateConflictError'
