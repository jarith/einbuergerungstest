import type { ChoiceOption } from '@einbuergerungstest/design-system'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { ChoiceGroup, Reveal } from '@einbuergerungstest/design-system'
import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { Check, X } from 'lucide-react'

import type { OptionLabel } from '../../domain/question-bank'
import type { LoadedQuestion } from '../../infrastructure/question-bank-resource'
import {
  getAnswerFeedback,
  selectQuestionOption,
  isQuestionTranslationAvailable,
} from '../../domain/question-answer'
import { QuestionImage } from '../question-image/question-image'
import { AnswerFeedback } from './components/answer-feedback/answer-feedback'
import { TranslationButton } from './components/translation-button/translation-button'
import {
  feedbackAnnouncement,
  questionTitle,
  reviewTitle,
  translationText,
} from './question-content.styles'

type QuestionInteraction =
  | Readonly<{
      mode: 'study'
      hasJustLearned: boolean
      shouldAnnounceFeedback: boolean
      onSelect: (option: OptionLabel) => void
      isPending?: boolean
    }>
  | Readonly<{
      mode: 'live-mock'
      onSelect: (option: OptionLabel) => void
      isPending?: boolean
    }>
  | Readonly<{ mode: 'completed-review' | 'unfinished-review' }>

export type QuestionContentProps = Readonly<{
  loaded: LoadedQuestion
  interaction: QuestionInteraction
  selectedOption: OptionLabel | null
  language: 'en' | 'de'
  translationEnabled: boolean
  onTranslationChange: (enabled: boolean) => void
  status?: ReactNode
  t: TFunction
}>

/** Controlled presentation: the owning application action records answers and retries. */
export const QuestionContent = ({
  loaded,
  interaction,
  selectedOption,
  language,
  translationEnabled,
  onTranslationChange,
  status,
  t,
}: QuestionContentProps) => {
  const { question, image } = loaded
  const hasTranslation = isQuestionTranslationAvailable(interaction.mode, language)
  const showTranslation = hasTranslation && translationEnabled
  const feedback = getAnswerFeedback(question, interaction.mode, selectedOption)

  const isReadOnly =
    interaction.mode === 'completed-review' || interaction.mode === 'unfinished-review'

  const isLocked = isReadOnly || (interaction.mode === 'study' && selectedOption !== null)
  const isPending = 'isPending' in interaction && interaction.isPending

  const options = question.answer_options.map((option) => {
    const result =
      feedback === 'hidden'
        ? undefined
        : option.label === question.correct_option
          ? ('correct' as const)
          : option.label === selectedOption
            ? ('incorrect' as const)
            : undefined

    const choice: ChoiceOption = {
      value: option.label,
      marker: option.label,
      label: <span lang="de">{option.text_de}</span>,
      description: hasTranslation ? (
        <Reveal opened={showTranslation}>
          <span lang="en">{option.text_en}</span>
        </Reveal>
      ) : null,
    }

    if (result === undefined) {
      return choice
    }

    return {
      ...choice,
      result,
      resultLabel: (
        <>
          {result === 'correct' ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <X size={16} aria-hidden="true" />
          )}
          {t(result === 'correct' ? 'study.correct' : 'study.mistaken')}
        </>
      ),
    }
  })

  return (
    <Stack gap="16" minWidth="0">
      {status !== undefined || hasTranslation ? (
        <Flex align="center" justify="space-between" gap="16">
          <div>{status}</div>
          {hasTranslation ? (
            <TranslationButton
              isEnabled={translationEnabled}
              isPending={isPending}
              onChange={onTranslationChange}
              t={t}
            />
          ) : null}
        </Flex>
      ) : null}
      <div>
        <h2
          lang="de"
          data-question-heading
          tabIndex={-1}
          className={isReadOnly ? reviewTitle : questionTitle}
        >
          {question.question_de}
        </h2>
        {hasTranslation ? (
          <Reveal opened={showTranslation}>
            <span lang="en" className={translationText}>
              {question.question_en}
            </span>
          </Reveal>
        ) : null}
      </div>
      {image === undefined ? null : (
        <QuestionImage
          key={image.url}
          image={image}
          alt={t('study.imageAlt', { number: question.order })}
          t={t}
        />
      )}
      <ChoiceGroup
        animateFeedback={interaction.mode === 'study' && interaction.shouldAnnounceFeedback}
        density="compact"
        aria-label={question.question_de}
        labelProps={{ lang: 'de' }}
        value={selectedOption ?? ''}
        readOnly={isLocked || isPending}
        aria-busy={isPending}
        options={options}
        onChange={(value) => {
          if (!isLocked && !isPending && 'onSelect' in interaction) {
            interaction.onSelect(selectQuestionOption(question, value))
          }
        }}
      />
      <div
        className={interaction.mode === 'study' ? feedbackAnnouncement : undefined}
        aria-live={
          interaction.mode === 'study' && interaction.shouldAnnounceFeedback ? 'polite' : 'off'
        }
        aria-atomic="true"
      >
        {interaction.mode === 'study' ? (
          feedback === 'hidden' ? null : (
            t(
              feedback === 'correct'
                ? interaction.hasJustLearned
                  ? 'study.nowLearned'
                  : 'study.correct'
                : 'study.mistaken',
            )
          )
        ) : (
          <AnswerFeedback
            question={question}
            feedback={feedback}
            hasJustLearned={false}
            showTranslation={false}
            t={t}
          />
        )}
      </div>
    </Stack>
  )
}
