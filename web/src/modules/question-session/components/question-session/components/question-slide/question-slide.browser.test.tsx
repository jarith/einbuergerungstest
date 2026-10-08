import { StrictMode } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { createQuestionMotion } from '../../../../question-motion/question-motion'
import { QuestionSlide } from './question-slide'

import '@einbuergerungstest/design-system/styles.css'

test('question slides survive StrictMode ref replay and clean up on unmount', async () => {
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

  await new Promise(requestAnimationFrame)

  const content = screen.getByText('Question 1', { exact: true }).element()

  expect(content.getAnimations()).toHaveLength(1)
  expect(getComputedStyle(content).transform).not.toBe('none')

  const [animation] = content.getAnimations()

  await screen.unmount()

  expect(animation?.playState).toBe('idle')
  expect(document.querySelector('[data-question-outgoing]')).toBeNull()
})
