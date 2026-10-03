/** Framework-free question-bank contracts and answer rules for other modules. */
export type {
  Question,
  QuestionBank,
  QuestionKey,
  QuestionGroup,
  OptionLabel,
  JsonValue,
} from './question-bank'
export type { QuestionMode, AnswerFeedback } from './question-answer'

export { getQuestionKey, isJsonValue } from './question-bank'
export {
  selectQuestionOption,
  isCorrectAnswer,
  getAnswerFeedback,
  isQuestionTranslationAvailable,
} from './question-answer'
