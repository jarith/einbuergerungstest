import { computed, effect, wrap } from '@reatom/core'
import { createInstance } from 'i18next'

import type { createLearnerState } from '../../modules/learner-state'
import type { QuestionMode } from '../../modules/question-bank/domain/question-answer'
import type { Question, QuestionGroup } from '../../modules/question-bank/domain/question-bank'
import { isQuestionTranslationAvailable } from '../../modules/question-bank/domain/question-answer'
import de from './de.json'
import en from './en.json'

export const createLocalization = async (learner: ReturnType<typeof createLearnerState>) => {
  const preferencesAtom = computed(() => {
    const snapshot = learner()

    if (snapshot === null) {
      throw new Error('Load learner preferences before initializing localization.')
    }

    return snapshot.preferences
  }, 'localization.preferences')

  const languageAtom = computed(() => preferencesAtom().language, 'localization.language')
  const i18n = createInstance()

  await wrap(
    i18n.init({
      lng: languageAtom(),
      fallbackLng: 'en',
      supportedLngs: ['en', 'de'],
      resources: { en: { translation: en }, de: { translation: de satisfies typeof en } },
      initAsync: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    }),
  )

  const synchronization = effect(() => {
    const current = languageAtom()

    // Both catalogs are already loaded, so language changes complete synchronously.
    void i18n.changeLanguage(current)

    document.documentElement.lang = current

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', i18n.t('app.description'))
  }, 'localization.synchronize')

  const canTranslate = (context: QuestionMode) =>
    isQuestionTranslationAvailable(context, languageAtom())

  const localizationAtom = preferencesAtom.extend(() => ({
    i18n,
    language: languageAtom,
    appearance: computed(() => preferencesAtom().appearance, 'localization.appearance'),
    translation: computed(
      () => ({ available: languageAtom() === 'en', enabled: preferencesAtom().studyTranslation }),
      'localization.translation',
    ),
    t: computed(() => i18n.getFixedT(languageAtom()), 'localization.t'),
    canTranslate,
    getGroup: (group: QuestionGroup) => ({
      id: group.id,
      title: languageAtom() === 'de' ? group.title_de : group.title,
      description: languageAtom() === 'de' ? group.description_de : group.description,
    }),
    getQuestion: (question: Question, context: QuestionMode) => {
      const showTranslation = canTranslate(context) && preferencesAtom().studyTranslation

      return {
        german: question.question_de,
        english: showTranslation ? question.question_en : null,
        options: question.answer_options.map((option) => ({
          label: option.label,
          german: option.text_de,
          english: showTranslation ? option.text_en : null,
        })),
      }
    },
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(languageAtom(), options).format(value),
    formatDate: (value: Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
      new Intl.DateTimeFormat(languageAtom(), options).format(value),
    // Calendar dates must not be parsed as UTC, which can display the previous day.
    formatPlannedDate: (value: string) =>
      new Intl.DateTimeFormat(languageAtom(), { dateStyle: 'long' }).format(
        new Date(`${value}T12:00:00`),
      ),
    dispose: synchronization.unsubscribe,
  }))

  return localizationAtom
}
