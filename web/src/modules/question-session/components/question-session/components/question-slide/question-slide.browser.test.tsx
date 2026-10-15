import { StrictMode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { createQuestionMotion } from '../../../../question-motion/question-motion'
import { QuestionSlide } from './question-slide'

import '@einbuergerungstest/design-system/styles.css'

afterEach(() => {
  vi.restoreAllMocks()
})

test('question slides survive StrictMode ref replay and clean up on unmount', async () => {
  // Keep the browser's real animations and cancellation behavior, but stop their
  // timelines at creation so a slow runner cannot miss the active transition.
  // oxlint-disable-next-line typescript/unbound-method -- Called below with the original Element receiver.
  const animate = Element.prototype.animate

  vi.spyOn(Element.prototype, 'animate').mockImplementation(function (
    this: Element,
    keyframes,
    options,
  ) {
    const animation = animate.call(this, keyframes, options)

    animation.pause()

    animation.currentTime = 1

    return animation
  })

  const motion = createQuestionMotion()

  const question = (index: number) => (
    <StrictMode>
      <QuestionSlide key={index} motion={motion} questionKey={String(index)} index={index}>
        <div>Question {index}</div>
      </QuestionSlide>
    </StrictMode>
  )

  const screen = await render(question(0))

  motion.prepare('0', 0, 'next')

  await screen.rerender(question(1))

  const content = screen.getByText('Question 1', { exact: true }).element()

  expect(content.getAnimations()).toHaveLength(1)
  expect(getComputedStyle(content).transform).not.toBe('none')

  const [animation] = content.getAnimations()
  const outgoing = screen.getByText('Question 0', { exact: true }).element()
  const [outgoingAnimation] = outgoing.getAnimations()

  await screen.unmount()

  expect(animation?.playState).toBe('idle')
  expect(outgoingAnimation?.playState).toBe('idle')
  expect(outgoing.parentElement).toBeNull()
})
