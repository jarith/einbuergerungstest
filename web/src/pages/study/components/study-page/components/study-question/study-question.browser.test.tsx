import { StrictMode } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { createStudyMotion } from '../../../../study-motion/study-motion'
import { StudyQuestion } from './study-question'

import '@einbuergerungstest/design-system/styles.css'

test('question slides survive StrictMode ref replay and clean up on unmount', async () => {
  const motion = createStudyMotion()

  const question = (index: number) => (
    <StrictMode>
      <StudyQuestion key={index} motion={motion} questionKey={String(index)} index={index}>
        <div>Question {index}</div>
      </StudyQuestion>
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
  expect(document.querySelector('[data-study-outgoing]')).toBeNull()
})
