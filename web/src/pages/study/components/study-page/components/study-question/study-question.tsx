import type { ReactNode } from 'react'
import { reatomFactoryComponent } from '@reatom/react'

import type { StudyModel } from '../../../../study.model'
import { styles } from '../../../../study-motion/study-motion.styles'

type StudyQuestionProps = Readonly<{
  motion: StudyModel['motion']
  questionKey: string
  index: number
  children: ReactNode
}>

/** Keyed by question so its DOM ref survives answer updates and route-model replacement. */
export const StudyQuestion = reatomFactoryComponent<StudyQuestionProps>((initial) => {
  const connect = (element: HTMLDivElement | null) =>
    initial.motion.connect(element, initial.questionKey, initial.index)

  return ({ children, questionKey }) => (
    <div className={styles.question} data-study-question={questionKey} ref={connect}>
      {children}
    </div>
  )
}, 'StudyQuestion')
