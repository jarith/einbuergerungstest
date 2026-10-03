import type { OptionLabel, Question } from './question-bank'

export type QuestionMode = 'study' | 'live-mock' | 'completed-review' | 'unfinished-review'

export type AnswerFeedback = 'correct' | 'incorrect' | 'unanswered' | 'hidden'

/** Validate selections at the application boundary, including values from UI controls. */
export const selectQuestionOption = (question: Question, value: string): OptionLabel => {
  const option = question.answer_options.find((candidate) => candidate.label === value)

  if (option === undefined) {
    throw new Error(`Question ${question.number} has no option ${value}. Choose A, B, C, or D.`)
  }

  return option.label
}

export const isCorrectAnswer = (question: Question, selection: OptionLabel | null): boolean =>
  selection === question.correct_option

export const getAnswerFeedback = (
  question: Question,
  mode: QuestionMode,
  selection: OptionLabel | null,
): AnswerFeedback => {
  if (mode === 'live-mock' || mode === 'unfinished-review') {
    return 'hidden'
  }

  if (selection === null) {
    return mode === 'completed-review' ? 'unanswered' : 'hidden'
  }

  return isCorrectAnswer(question, selection) ? 'correct' : 'incorrect'
}

export const isQuestionTranslationAvailable = (
  mode: QuestionMode,
  language: 'en' | 'de',
): boolean => language === 'en' && (mode === 'study' || mode === 'completed-review')
