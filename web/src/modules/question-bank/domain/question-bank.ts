/* oxlint-disable app/no-runtime-typeof -- JSON is decoded at this I/O boundary. */

export type QuestionSection = 'general' | 'berlin'

export type OptionLabel = 'A' | 'B' | 'C' | 'D'

export type QuestionKey = `${QuestionSection}:${number}`

export type QuestionGroup = Readonly<{
  id: string
  title: string
  title_de: string
  description: string
  description_de: string
}>

export type AnswerOption = Readonly<{
  label: OptionLabel
  text_de: string
  text_en: string
}>

export type ImageVariant = Readonly<{ width: number; resource: string }>

export type Question = Readonly<{
  number: number
  section: QuestionSection
  source_question_id: number
  group_id: string
  question_de: string
  question_en: string
  answer_options: readonly AnswerOption[]
  correct_option: OptionLabel
  question_image_resource?: string
  question_image_width?: number
  question_image_height?: number
  question_image_variants?: readonly ImageVariant[]
}>

export type QuestionBank = Readonly<{
  region: 'Berlin'
  question_count: 310
  groups: readonly QuestionGroup[]
  questions: readonly Question[]
}>

export type JsonValue = string | number | boolean | null | readonly JsonValue[] | JsonObject

type JsonObject = Readonly<{ [key: string]: JsonValue | undefined }>

export type ImageMetadata = Readonly<{ width: number; height: number | undefined }>

type ImageEntry = readonly [string, ImageMetadata]

export const isJsonValue = (value: unknown): value is JsonValue => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return true
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue)
  }

  return typeof value === 'object' && Object.values(value).every(isJsonValue)
}

const labels: readonly OptionLabel[] = ['A', 'B', 'C', 'D']

const resourcePattern = /^images\/(?:480|960|full)\/question-\d{3}\.webp$/

const fail = (place: string, issue: string): never => {
  throw new Error(`Invalid question bank at ${place}: ${issue}`)
}

const isRecord = (value: JsonValue | undefined): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const requireRecord = (value: JsonValue | undefined, place: string): JsonObject => {
  if (!isRecord(value)) {
    return fail(place, 'expected an object')
  }

  return value
}

const requireArray = (
  value: JsonValue | undefined,
  place: string,
  length?: number,
): readonly JsonValue[] => {
  if (!Array.isArray(value) || (length !== undefined && value.length !== length)) {
    return fail(place, length === undefined ? 'expected an array' : `expected ${length} entries`)
  }

  if (!value.every(isJsonValue)) {
    return fail(place, 'expected JSON entries')
  }

  return value
}

const requireText = (value: JsonValue | undefined, place: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fail(place, 'expected nonempty text')
  }

  return value
}

const requirePositiveInteger = (value: JsonValue | undefined, place: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    return fail(place, 'expected a positive integer')
  }

  return value
}

const requireLabel = (value: JsonValue | undefined, place: string): OptionLabel => {
  if (value !== 'A' && value !== 'B' && value !== 'C' && value !== 'D') {
    return fail(place, 'expected A, B, C, or D')
  }

  return value
}

const requireSection = (value: JsonValue | undefined, place: string): QuestionSection => {
  if (value !== 'general' && value !== 'berlin') {
    return fail(place, 'expected general or berlin')
  }

  return value
}

const requireResource = (value: JsonValue | undefined, place: string): string => {
  const resource = requireText(value, place)

  if (!resourcePattern.test(resource)) {
    return fail(place, 'expected a local WebP resource')
  }

  return resource
}

export const getQuestionKey = (
  question: Pick<Question, 'section' | 'source_question_id'>,
): QuestionKey => `${question.section}:${question.source_question_id}`

export const getImageMetadata = (bank: QuestionBank): ReadonlyMap<string, ImageMetadata> => {
  const entries = bank.questions.flatMap(
    (question) =>
      question.question_image_variants?.map((variant): ImageEntry => [
        variant.resource,
        {
          width: variant.width,
          height:
            variant.resource === question.question_image_resource
              ? question.question_image_height
              : undefined,
        },
      ]) ?? [],
  )

  return entries.reduce((images, [resource, metadata]) => {
    const previous = images.get(resource)

    if (
      previous !== undefined &&
      (previous.width !== metadata.width ||
        (previous.height !== undefined &&
          metadata.height !== undefined &&
          previous.height !== metadata.height))
    ) {
      return fail(`images.${resource}`, 'conflicting dimensions for a shared image')
    }

    images.set(resource, { width: metadata.width, height: previous?.height ?? metadata.height })

    return images
  }, new Map<string, ImageMetadata>())
}

const parseGroup = (raw: JsonValue, index: number): QuestionGroup => {
  const place = `groups[${index}]`
  const group = requireRecord(raw, place)
  const id = requireText(group['id'], `${place}.id`)

  if (!/^[a-z]+(?:-[a-z]+)*$/.test(id)) {
    return fail(`${place}.id`, 'expected a slug')
  }

  return {
    id,
    title: requireText(group['title'], `${place}.title`),
    title_de: requireText(group['title_de'], `${place}.title_de`),
    description: requireText(group['description'], `${place}.description`),
    description_de: requireText(group['description_de'], `${place}.description_de`),
  }
}

const parseImage = (entry: JsonObject, place: string) => {
  const resourceValue = entry['question_image_resource']
  const widthValue = entry['question_image_width']
  const heightValue = entry['question_image_height']
  const variantsValue = entry['question_image_variants']

  if (
    resourceValue === undefined &&
    widthValue === undefined &&
    heightValue === undefined &&
    variantsValue === undefined
  ) {
    return {}
  }
  const resource = requireResource(resourceValue, `${place}.question_image_resource`)
  const width = requirePositiveInteger(widthValue, `${place}.question_image_width`)
  const height = requirePositiveInteger(heightValue, `${place}.question_image_height`)
  const rawVariants = requireArray(variantsValue, `${place}.question_image_variants`)

  if (rawVariants.length === 0) {
    return fail(`${place}.question_image_variants`, 'expected variants')
  }
  const widths = new Set<number>()

  const variants: ImageVariant[] = rawVariants.map((raw, index) => {
    const variantPlace = `${place}.question_image_variants[${index}]`
    const variant = requireRecord(raw, variantPlace)
    const variantWidth = requirePositiveInteger(variant['width'], `${variantPlace}.width`)
    const variantResource = requireResource(variant['resource'], `${variantPlace}.resource`)

    if (variantWidth > width || widths.has(variantWidth)) {
      return fail(variantPlace, 'variant width exceeds full width or is duplicated')
    }

    widths.add(variantWidth)

    return { width: variantWidth, resource: variantResource }
  })

  if (!variants.some((variant) => variant.resource === resource && variant.width === width)) {
    return fail(place, 'full image must appear among the variants with its width')
  }

  return {
    question_image_resource: resource,
    question_image_width: width,
    question_image_height: height,
    question_image_variants: variants,
  }
}

const parseQuestion = (raw: JsonValue, index: number): Question => {
  const place = `questions[${index}]`
  const entry = requireRecord(raw, place)
  const number = requirePositiveInteger(entry['number'], `${place}.number`)

  if (number > 310) {
    return fail(`${place}.number`, 'expected 1 to 310')
  }
  const section = requireSection(entry['section'], `${place}.section`)

  const source_question_id = requirePositiveInteger(
    entry['source_question_id'],
    `${place}.source_question_id`,
  )

  const maxSourceId = section === 'general' ? 300 : 10

  if (source_question_id > maxSourceId) {
    return fail(`${place}.source_question_id`, `expected 1 to ${maxSourceId}`)
  }

  const answer_options: AnswerOption[] = requireArray(
    entry['answer_options'],
    `${place}.answer_options`,
    4,
  ).map((rawOption, optionIndex) => {
    const optionPlace = `${place}.answer_options[${optionIndex}]`
    const option = requireRecord(rawOption, optionPlace)
    const label = requireLabel(option['label'], `${optionPlace}.label`)

    if (label !== labels[optionIndex]) {
      return fail(optionPlace, `expected label ${labels[optionIndex]}`)
    }

    return {
      label,
      text_de: requireText(option['text_de'], `${optionPlace}.text_de`),
      text_en: requireText(option['text_en'], `${optionPlace}.text_en`),
    }
  })

  return {
    number,
    section,
    source_question_id,
    group_id: requireText(entry['group_id'], `${place}.group_id`),
    question_de: requireText(entry['question_de'], `${place}.question_de`),
    question_en: requireText(entry['question_en'], `${place}.question_en`),
    answer_options,
    correct_option: requireLabel(entry['correct_option'], `${place}.correct_option`),
    ...parseImage(entry, place),
  }
}

export const parseQuestionBank = (value: JsonValue): QuestionBank => {
  const root = requireRecord(value, 'root')

  if (root['region'] !== 'Berlin') {
    return fail('region', 'expected Berlin')
  }

  if (root['question_count'] !== 310) {
    return fail('question_count', 'expected 310')
  }
  const groups = requireArray(root['groups'], 'groups', 13).map(parseGroup)
  const questions = requireArray(root['questions'], 'questions', 310).map(parseQuestion)
  const groupIds = new Set(groups.map((group) => group.id))

  if (groupIds.size !== groups.length) {
    return fail('groups', 'duplicate group ID')
  }

  if (!groupIds.has('berlin')) {
    return fail('groups', 'missing Berlin group')
  }
  const keys = questions.map(getQuestionKey)
  const numbers = questions.map((question) => question.number)

  const sourceIds = {
    general: new Set(
      questions
        .filter((question) => question.section === 'general')
        .map((question) => question.source_question_id),
    ),
    berlin: new Set(
      questions
        .filter((question) => question.section === 'berlin')
        .map((question) => question.source_question_id),
    ),
  }

  for (const question of questions) {
    const key = getQuestionKey(question)

    if (keys.indexOf(key) !== keys.lastIndexOf(key)) {
      return fail(`questions.${key}`, 'duplicate stable key')
    }

    if (numbers.indexOf(question.number) !== numbers.lastIndexOf(question.number)) {
      return fail(`questions.${key}`, 'duplicate display number')
    }

    if (!groupIds.has(question.group_id)) {
      return fail(`questions.${key}.group_id`, 'unknown group')
    }

    if (question.section === 'berlin' && question.group_id !== 'berlin') {
      return fail(`questions.${key}.group_id`, 'Berlin question outside Berlin group')
    }

    if (question.section === 'general' && question.group_id === 'berlin') {
      return fail(`questions.${key}.group_id`, 'general question in Berlin group')
    }
  }

  if (sourceIds.general.size !== 300 || sourceIds.berlin.size !== 10) {
    return fail('questions', 'expected source IDs 1–300 general and 1–10 Berlin')
  }

  for (const group of groups) {
    if (!questions.some((question) => question.group_id === group.id)) {
      return fail(`groups.${group.id}`, 'group has no questions')
    }
  }

  const bank: QuestionBank = { region: 'Berlin', question_count: 310, groups, questions }

  getImageMetadata(bank)

  return bank
}
