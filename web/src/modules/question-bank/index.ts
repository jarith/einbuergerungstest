export type { Question, QuestionBank, QuestionKey, QuestionGroup } from './domain/question-bank'
export type { OptionLabel } from './domain/question-bank'
export type { QuestionMode, AnswerFeedback } from './domain/question-answer'
export type { ResolvedQuestionImage, LoadedQuestion } from './infrastructure/question-bank-resource'

export { getQuestionKey } from './domain/question-bank'
export { selectQuestionOption, isCorrectAnswer, getAnswerFeedback } from './domain/question-answer'
export { fetchQuestionBank, resolveQuestionImage } from './infrastructure/question-bank-resource'
export { QuestionContent } from './components/question-content/question-content'

export type { QuestionContentProps } from './components/question-content/question-content'
