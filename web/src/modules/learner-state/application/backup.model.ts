import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type { createLearnerState } from './learner-state.model'
import { isLearnerStateConflict } from '../infrastructure/learner-state-conflict-error'

export const createBackupModel = (learner: ReturnType<typeof createLearnerState>) => {
  const file = atom<File | null>(null, 'backup.file')

  const message = atom<'invalid' | 'storage' | 'conflict' | 'exported' | 'replaced' | null>(
    null,
    'backup.message',
  )

  const confirmationKind = atom<'import' | 'reset' | null>(null, 'backup.confirmationKind')

  const selectFile = action(async (selected: File | null) => {
    file.set(selected)

    message.set(null)

    learner.cancelReplacement()

    if (selected === null) {
      return
    }
    try {
      const source = await wrap(selected.text())

      if (file() === selected) {
        learner.previewImport(source)
      }
    } catch {
      if (file() === selected) {
        message.set('invalid')
      }
    }
  }, 'backup.selectFile').extend(withAsync())

  const cancel = action(() => {
    file.set(null)

    confirmationKind.set(null)

    learner.cancelReplacement()
  }, 'backup.cancel')

  return computed(() => learner.confirmation(), 'backup').extend(() => ({
    file,
    message,
    selectFile,
    cancel,
    confirmationKind,
    isConfirming: computed(() => confirmationKind() !== null, 'backup.isConfirming'),
    pending: computed(() => learner.pending() > 0 || selectFile.pending() > 0, 'backup.pending'),
    requestImport: action(() => confirmationKind.set('import'), 'backup.requestImport'),
    requestReset: action(() => {
      file.set(null)

      message.set(null)

      learner.requestReset()

      confirmationKind.set('reset')
    }, 'backup.requestReset'),
    confirm: action(async () => {
      try {
        await wrap(learner.confirmReplacement())

        cancel()

        message.set('replaced')
      } catch (cause) {
        message.set(
          cause instanceof Error && isLearnerStateConflict(cause) ? 'conflict' : 'storage',
        )
      }
    }, 'backup.confirm').extend(withAsync()),
    download: action(async () => {
      try {
        const source = await wrap(learner.exportBackup())
        const url = URL.createObjectURL(new Blob([source], { type: 'application/json' }))
        const link = document.createElement('a')
        link.href = url
        link.download = 'berlin-progress.json'

        link.click()

        setTimeout(() => URL.revokeObjectURL(url), 0)

        message.set('exported')
      } catch {
        message.set('storage')
      }
    }, 'backup.download').extend(withAsync()),
  }))
}
