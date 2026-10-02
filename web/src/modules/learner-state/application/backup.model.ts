import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type { createLearnerState } from './learner-state.model'

export const createBackupModel = (learner: ReturnType<typeof createLearnerState>) => {
  const file = atom<File | null>(null, 'backup.file')

  const message = atom<'invalid' | 'storage' | 'exported' | 'replaced' | null>(
    null,
    'backup.message',
  )

  const isConfirming = atom(false, 'backup.isConfirming')

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

    isConfirming.set(false)

    learner.cancelReplacement()
  }, 'backup.cancel')

  return computed(() => learner.confirmation(), 'backup').extend(() => ({
    file,
    message,
    selectFile,
    cancel,
    isConfirming,
    pending: computed(() => learner.pending() > 0 || selectFile.pending() > 0, 'backup.pending'),
    requestImport: action(() => isConfirming.set(true), 'backup.requestImport'),
    requestReset: action(() => {
      file.set(null)

      message.set(null)

      learner.requestReset()

      isConfirming.set(true)
    }, 'backup.requestReset'),
    confirm: action(async () => {
      try {
        await wrap(learner.confirmReplacement())

        cancel()

        message.set('replaced')
      } catch {
        message.set('storage')
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
