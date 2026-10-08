import { action, computed, withAsync, wrap } from '@reatom/core'

import type { OptionLabel, QuestionKey } from '../question-bank'
import type { QuestionMotion } from './question-motion/question-motion'

type SessionPosition = Readonly<{
  key: QuestionKey
  index: number
  total: number
  isPending: boolean
  canAnswer: boolean
  canFinish: boolean
}>

type SessionAdapter = Readonly<{
  current: () => SessionPosition
  answer: (option: OptionLabel) => Promise<void>
  // Returns false when saving failed or no question navigation took place.
  navigate: (index: number) => boolean | Promise<boolean>
}>

/** Shared interaction; adapters own each mode's persistence and completion rules. */
export const createQuestionSession = (adapter: SessionAdapter, motion: QuestionMotion) => {
  const current = computed(adapter.current, 'questionSession.current')

  const go = action(async (index: number) => {
    const before = current()
    const limit = before.canFinish ? before.total : before.total - 1

    if (before.isPending || index < 0 || index > limit || index === before.index) {
      return
    }

    if (Math.abs(index - before.index) === 1 && index < before.total) {
      motion.prepare(before.key, before.index, index > before.index ? 'next' : 'previous')
    } else {
      motion.clear()
    }

    try {
      if (!(await wrap(adapter.navigate(index)))) {
        motion.clear()
      }
    } catch (error) {
      motion.clear()

      throw error
    }
  }, 'questionSession.go').extend(withAsync())

  return current.extend(() => ({
    motion,
    go,
    previous: action(() => go(current().index - 1), 'questionSession.previous').extend(withAsync()),
    next: action(() => go(current().index + 1), 'questionSession.next').extend(withAsync()),
    answer: action(async (option: OptionLabel) => {
      if (!current().isPending && current().canAnswer) {
        await wrap(adapter.answer(option))
      }
    }, 'questionSession.answer').extend(withAsync()),
  }))
}

export type QuestionSessionModel = ReturnType<typeof createQuestionSession>
