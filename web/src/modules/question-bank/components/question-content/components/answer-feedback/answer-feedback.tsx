import type { TFunction } from 'i18next'
import { InlineNotice } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { Check, X, CircleHelp } from 'lucide-react'

import type { AnswerFeedback as Feedback } from '../../../../domain/question-answer'
import type { Question } from '../../../../domain/question-bank'

type AnswerFeedbackProps = Readonly<{
  question: Question
  feedback: Feedback
  hasJustLearned: boolean
  showTranslation: boolean
  t: TFunction
}>

export const AnswerFeedback = ({
  question,
  feedback,
  hasJustLearned,
  showTranslation,
  t,
}: AnswerFeedbackProps) => {
  if (feedback === 'hidden') {
    return null
  }

  const correctOption = question.answer_options.find(
    (option) => option.label === question.correct_option,
  )

  return (
    <InlineNotice
      intent={feedback === 'correct' ? 'success' : feedback === 'incorrect' ? 'danger' : 'info'}
      icon={
        feedback === 'correct' ? (
          <Check aria-hidden="true" />
        ) : feedback === 'incorrect' ? (
          <X aria-hidden="true" />
        ) : (
          <CircleHelp aria-hidden="true" />
        )
      }
      title={t(
        feedback === 'correct'
          ? hasJustLearned
            ? 'study.nowLearned'
            : 'study.correct'
          : feedback === 'incorrect'
            ? 'study.mistaken'
            : 'mock.unanswered',
      )}
    >
      {feedback === 'correct' ? (
        hasJustLearned ? (
          t('study.learnedReason')
        ) : null
      ) : (
        <Stack gap="4">
          <p>
            {t('study.correctAnswer', { answer: question.correct_option })}
            {' — '}
            <span lang="de">{correctOption?.text_de}</span>
          </p>
          {showTranslation ? <p lang="en">{correctOption?.text_en}</p> : null}
        </Stack>
      )}
    </InlineNotice>
  )
}
