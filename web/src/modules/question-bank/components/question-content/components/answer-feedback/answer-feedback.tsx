import type { TFunction } from 'i18next'
import { InlineNotice } from '@einbuergerungstest/design-system'
import { Check, X, CircleHelp } from 'lucide-react'

import type { AnswerFeedback as Feedback } from '../../../../domain/question-answer'
import type { Question } from '../../../../domain/question-bank'

type AnswerFeedbackProps = Readonly<{ question: Question; feedback: Feedback; t: TFunction }>

export const AnswerFeedback = ({ question, feedback, t }: AnswerFeedbackProps) => {
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
          ? 'study.correct'
          : feedback === 'incorrect'
            ? 'study.mistaken'
            : 'mock.unanswered',
      )}
    >
      {t('study.correctAnswer', { answer: question.correct_option })}
      {' — '}
      <span lang="de">{correctOption?.text_de}</span>
    </InlineNotice>
  )
}
