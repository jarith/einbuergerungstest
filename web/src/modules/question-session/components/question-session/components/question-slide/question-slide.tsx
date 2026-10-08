import type { ReactNode } from 'react'
import { reatomFactoryComponent } from '@reatom/react'

import type { QuestionMotion } from '../../../../question-motion/question-motion'
import { styles } from '../../../../question-motion/question-motion.styles'

type QuestionSlideProps = Readonly<{
  motion: QuestionMotion
  questionKey: string
  index: number
  children: ReactNode
}>

/** Keyed by question so its DOM ref survives answer updates and route-model replacement. */
export const QuestionSlide = reatomFactoryComponent<QuestionSlideProps>((initial) => {
  const connect = (element: HTMLDivElement | null) =>
    initial.motion.connect(element, initial.questionKey, initial.index)

  return ({ children, questionKey }) => (
    <div className={styles.question} data-question-slide={questionKey} ref={connect}>
      {children}
    </div>
  )
}, 'QuestionSlide')
