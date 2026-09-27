import type { QuestionBank } from '../domain/question-bank'
import { isJsonValue, parseQuestionBank } from '../domain/question-bank'

type LoadedQuestionBank = Readonly<{ bank: QuestionBank; url: URL }>

export type ResolvedImageVariant = Readonly<{ width: number; url: string }>

export type ResolvedQuestionImage = Readonly<{
  url: string
  width: number
  height: number
  variants: readonly ResolvedImageVariant[]
}>

export const getQuestionBankUrl = () =>
  new URL('questionbank-berlin.json', new URL(import.meta.env.BASE_URL, location.origin))

export const resolveQuestionImage = (
  question: QuestionBank['questions'][number],
  bankUrl: URL,
): ResolvedQuestionImage | undefined => {
  if (
    question.question_image_resource === undefined ||
    question.question_image_width === undefined ||
    question.question_image_height === undefined ||
    question.question_image_variants === undefined
  ) {
    return undefined
  }

  const toUrl = (resource: string) => new URL(resource, bankUrl).href

  return {
    url: toUrl(question.question_image_resource),
    width: question.question_image_width,
    height: question.question_image_height,
    variants: question.question_image_variants.map((variant) => ({
      width: variant.width,
      url: toUrl(variant.resource),
    })),
  }
}

export const fetchQuestionBank = async (): Promise<LoadedQuestionBank> => {
  const url = getQuestionBankUrl()
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Question bank could not be loaded (${response.status}).`)
  }
  const value: unknown = await response.json()

  if (!isJsonValue(value)) {
    throw new Error('Question bank response is not valid JSON data.')
  }
  const bank = parseQuestionBank(value)

  return { bank, url }
}
