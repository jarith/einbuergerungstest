import { action, atom, computed, reatomField, withAsync, withComputed, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import type { Preferences } from '../../modules/learner-state'
import {
  createBackupModel,
  getLocalDate,
  isLearnerStateConflict,
} from '../../modules/learner-state'

export const createSettingsModel = ({ learner }: AppResources) => {
  const error = atom<'storage' | 'conflict' | null>(null, 'settings.error')

  const savedDate = computed(
    () => learner()?.preferences.plannedTestDate ?? '',
    'settings.savedDate',
  )

  const date = reatomField(learner()?.preferences.plannedTestDate ?? '', {
    name: 'settings.date',
    validateOnBlur: true,
    validate: ({ state }) =>
      state !== '' && state < getLocalDate(new Date()) ? 'past' : undefined,
  }).extend(withComputed(() => savedDate()))

  const save = action(async (patch: Partial<Preferences>) => {
    error.set(null)

    try {
      await wrap(learner.updatePreferences(patch))

      return true
    } catch (cause) {
      error.set(cause instanceof Error && isLearnerStateConflict(cause) ? 'conflict' : 'storage')

      return false
    }
  }, 'settings.save').extend(withAsync())

  return computed(() => learner()?.preferences, 'settings').extend(() => ({
    date,
    error,
    backup: createBackupModel(learner),
    pending: computed(() => learner.pending() > 0, 'settings.pending'),
    setLanguage: action((language: string) => {
      if (language === 'en' || language === 'de') {
        void save({ language })
      }
    }, 'settings.setLanguage'),
    setAppearance: action((appearance: string) => {
      if (appearance === 'light' || appearance === 'dark') {
        void save({ appearance })
      }
    }, 'settings.setAppearance'),
    saveDate: action(async () => {
      if (learner.pending() > 0) {
        return
      }

      await wrap(date.validation.trigger())

      if (date.validation().error === undefined && date() !== savedDate()) {
        await wrap(save({ plannedTestDate: date() === '' ? null : date() }))
      }
    }, 'settings.saveDate').extend(withAsync()),
    clearDate: action(async () => {
      if (await wrap(save({ plannedTestDate: null }))) {
        date.reset('')
      }
    }, 'settings.clearDate').extend(withAsync()),
  }))
}

export type SettingsData = AppResources &
  Readonly<{ settings: ReturnType<typeof createSettingsModel> }>
