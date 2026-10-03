/** A readable snapshot was rejected; keep its exact bytes available for recovery. */
export const createSavedLearnerDataError = (source: string, cause: unknown) =>
  Object.assign(
    new Error('Saved learner data is unsupported or damaged. Download it before resetting.', {
      cause,
    }),
    { name: 'SavedLearnerDataError', source },
  )

export type SavedLearnerDataError = ReturnType<typeof createSavedLearnerDataError>

export const isSavedLearnerDataError = (error: Error | undefined): error is SavedLearnerDataError =>
  error?.name === 'SavedLearnerDataError'
