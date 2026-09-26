import { context } from '@reatom/core'
import { describe, expect, test } from 'vitest'

import { createCounterModel } from './counter.model'

describe('counter model', () => {
  test('increments, derives the doubled value and resets', () => {
    context.start().run(() => {
      const model = createCounterModel()
      expect(model()).toBe(0)

      model.increment()

      model.increment()

      expect(model()).toBe(2)
      expect(model.doubled()).toBe(4)

      model.reset()

      expect(model()).toBe(0)
      expect(model.doubled()).toBe(0)
    })
  })

  test('isolates independently created models', () => {
    context.start().run(() => {
      const first = createCounterModel()
      const second = createCounterModel()

      first.increment()

      expect(first()).toBe(1)
      expect(second()).toBe(0)
    })
  })
})
