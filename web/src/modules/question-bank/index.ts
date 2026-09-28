export type { Question, QuestionBank, QuestionKey, QuestionGroup } from './domain/question-bank'
export type { ResolvedQuestionImage, LoadedQuestion } from './infrastructure/question-bank-resource'

export { getQuestionKey } from './domain/question-bank'
export { fetchQuestionBank, resolveQuestionImage } from './infrastructure/question-bank-resource'
