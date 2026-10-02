import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type { SavedLearnerDataError } from '../infrastructure/saved-learner-data-error'
import { downloadJson } from '../../../shared/files/download-json'
import { createLearnerRepository } from '../infrastructure/learner-repository'
import { isLearnerStateConflict } from '../infrastructure/learner-state-conflict-error'
import { isSavedLearnerDataError } from '../infrastructure/saved-learner-data-error'

export const createStartupRecovery = (getError: () => Error | undefined, retry: () => void) => {
  const repository = createLearnerRepository()
  const confirmation = atom<SavedLearnerDataError | null>(null, 'startupRecovery.confirmation')
  const message = atom<'storage' | 'conflict' | null>(null, 'startupRecovery.message')

  const rejected = computed(() => {
    const error = getError()

    return isSavedLearnerDataError(error) ? error : null
  }, 'startupRecovery.rejected')

  const confirm = action(async () => {
    const expected = confirmation()

    if (expected === null) {
      return
    }

    message.set(null)

    try {
      await wrap(repository.resetRejected(expected))

      confirmation.set(null)

      retry()
    } catch (cause) {
      message.set(cause instanceof Error && isLearnerStateConflict(cause) ? 'conflict' : 'storage')
    }
  }, 'startupRecovery.confirm').extend(withAsync())

  return rejected.extend(() => ({
    confirmation,
    message,
    confirm,
    pending: computed(() => confirm.pending() > 0, 'startupRecovery.pending'),
    requestReset: action(() => {
      message.set(null)

      confirmation.set(rejected())
    }, 'startupRecovery.requestReset'),
    cancel: action(() => confirmation.set(null), 'startupRecovery.cancel'),
    download: action(() => {
      const error = rejected()

      if (error !== null) {
        downloadJson(error.source, 'berlin-saved-data.json')
      }
    }, 'startupRecovery.download'),
  }))
}
