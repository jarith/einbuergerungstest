/* oxlint-disable app/no-runtime-typeof -- Validate untrusted backup and IndexedDB data at the I/O boundary. */
import type { JsonValue, QuestionKey, OptionLabel } from '../../question-bank/domain'
import type { LearnerSnapshot, MockSitting, StudyPosition } from '../domain/learner-state'
import { isJsonValue } from '../../question-bank/domain'

type JsonRecord = Readonly<{ [key: string]: JsonValue | undefined }>

const invalid = (place: string): never => {
  throw new Error(
    `Invalid learner backup at ${place}. Choose a complete supported backup; existing data has not been replaced.`,
  )
}

const isRecord = (value: JsonValue | undefined): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const record = (value: JsonValue | undefined, place: string): JsonRecord => {
  if (!isRecord(value)) {
    return invalid(place)
  }

  return value
}

const array = (value: JsonValue | undefined, place: string): readonly JsonValue[] => {
  if (!Array.isArray(value) || !value.every(isJsonValue)) {
    return invalid(place)
  }

  return value
}

const text = (value: JsonValue | undefined, place: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    return invalid(place)
  }

  return value
}

const integer = (value: JsonValue | undefined, place: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 8.64e15) {
    return invalid(place)
  }

  return value
}

const key = (value: JsonValue | undefined): QuestionKey => {
  const result = text(value, 'questionKey')

  if (!/^(general|berlin):[1-9]\d*$/.test(result)) {
    return invalid('questionKey')
  }

  const [section, sourceId] = result.split(':')
  const number = Number(sourceId)

  if ((section !== 'general' && section !== 'berlin') || !Number.isSafeInteger(number)) {
    return invalid('questionKey')
  }

  return `${section}:${number}`
}

const option = (value: JsonValue | undefined): OptionLabel => {
  if (value !== 'A' && value !== 'B' && value !== 'C' && value !== 'D') {
    return invalid('selectedOption')
  }

  return value
}

export const parsePlannedDate = (value: JsonValue | undefined): string | null => {
  if (value === null) {
    return null
  }
  const result = text(value, 'plannedTestDate')
  const date = new Date(`${result}T00:00:00Z`)

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(result) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== result
  ) {
    return invalid('plannedTestDate')
  }

  return result
}

const position = (value: JsonValue | undefined): StudyPosition => {
  const entry = record(value, 'position')
  const status = entry['status']

  if (status !== 'in-progress' && status !== 'completed') {
    return invalid('position.status')
  }

  return { questionKey: key(entry['questionKey']), status }
}

const unique = (values: readonly string[], place: string) => {
  if (new Set(values).size !== values.length) {
    invalid(`${place}: duplicate identifier`)
  }
}

const mock = (value: JsonValue): MockSitting => {
  const entry = record(value, 'mockSitting')
  const startedAt = integer(entry['startedAt'], 'startedAt')
  const deadline = integer(entry['deadline'], 'deadline')
  const currentQuestion = integer(entry['currentQuestion'], 'currentQuestion')

  const answers = array(entry['answers'], 'answers').map((raw) => {
    const answer = record(raw, 'answer')

    return {
      questionKey: key(answer['questionKey']),
      selectedOption: answer['selectedOption'] === null ? null : option(answer['selectedOption']),
    }
  })

  unique(
    answers.map((answer) => answer.questionKey),
    'paper',
  )

  if (
    answers.length !== 33 ||
    answers.filter((answer) => answer.questionKey.startsWith('general:')).length !== 30 ||
    currentQuestion >= answers.length ||
    deadline !== startedAt + 60 * 60 * 1000
  ) {
    return invalid('mock paper, cursor, or deadline')
  }

  const paper = {
    id: text(entry['id'], 'mock.id'),
    startedAt,
    deadline,
    currentQuestion,
    answers,
  }

  const status = entry['status']

  if (status === 'active') {
    if (entry['endedAt'] !== undefined) {
      return invalid('active mock endedAt')
    }

    return { ...paper, status }
  }

  if (status !== 'completed' && status !== 'unfinished') {
    return invalid('mock.status')
  }
  const endedAt = integer(entry['endedAt'], 'endedAt')

  if (endedAt < startedAt) {
    return invalid('mock.endedAt')
  }

  if (status === 'unfinished') {
    return { ...paper, status, endedAt }
  }
  const finishReason = entry['finishReason']

  if (finishReason !== 'submitted' && finishReason !== 'timeout') {
    return invalid('mock.finishReason')
  }

  return { ...paper, status, endedAt, finishReason }
}

export const parseLearnerSnapshot = (value: JsonValue): LearnerSnapshot => {
  const root = record(value, 'snapshot')

  if (root['version'] !== 2) {
    return invalid('version (only version 2 is supported; no implicit migration)')
  }
  const preferences = record(root['preferences'], 'preferences')
  const language = preferences['language']
  const studyTranslation = preferences['studyTranslation']
  const appearance = preferences['appearance']

  if (
    (language !== 'en' && language !== 'de') ||
    typeof studyTranslation !== 'boolean' ||
    (appearance !== 'light' && appearance !== 'dark')
  ) {
    return invalid('preferences')
  }
  const positions = record(root['positions'], 'positions')

  const groups = Object.fromEntries(
    Object.entries(record(positions['groups'], 'groups')).map(([id, entry]) => {
      if (!/^[a-z]+(?:-[a-z]+)*$/.test(id)) {
        return invalid('group ID')
      }

      return [id, position(entry)]
    }),
  )

  const studyAttempts = array(root['studyAttempts'], 'studyAttempts').map((raw) => {
    const entry = record(raw, 'studyAttempt')

    return {
      id: text(entry['id'], 'attempt.id'),
      questionKey: key(entry['questionKey']),
      selectedOption: option(entry['selectedOption']),
      answeredAt: integer(entry['answeredAt'], 'answeredAt'),
    }
  })

  const mockSittings = array(root['mockSittings'], 'mockSittings').map(mock)

  unique(
    studyAttempts.map((attempt) => attempt.id),
    'studyAttempts',
  )

  unique(
    mockSittings.map((sitting) => sitting.id),
    'mockSittings',
  )

  if (mockSittings.filter((sitting) => sitting.status === 'active').length > 1) {
    return invalid('multiple active mocks')
  }

  return {
    version: 2,
    preferences: {
      language,
      studyTranslation,
      appearance,
      plannedTestDate: parsePlannedDate(preferences['plannedTestDate']),
    },
    positions: {
      all: positions['all'] === null ? null : position(positions['all']),
      groups,
    },
    studyAttempts,
    mockSittings,
  }
}

const freezeJson = (value: JsonValue): void => {
  if (Array.isArray(value) && value.every(isJsonValue)) {
    value.forEach(freezeJson)
  } else if (isRecord(value)) {
    Object.values(value).forEach((entry) => {
      if (entry !== undefined) {
        freezeJson(entry)
      }
    })
  }

  Object.freeze(value)
}

export const decodeLearnerSnapshot = (source: string): LearnerSnapshot => {
  const value: unknown = JSON.parse(source)

  if (!isJsonValue(value)) {
    return invalid('JSON')
  }

  const snapshot = parseLearnerSnapshot(value)

  freezeJson(snapshot)

  return snapshot
}
