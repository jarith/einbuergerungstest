import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { QuestionContentProps } from '../../../question-bank'
import type { QuestionSessionModel } from '../../question-session.model'
import { QuestionContent } from '../../../question-bank'
import { QuestionControls } from './components/question-controls/question-controls'
import { QuestionSlide } from './components/question-slide/question-slide'

type SessionInteraction =
  | Omit<Extract<QuestionContentProps['interaction'], { mode: 'study' }>, 'onSelect' | 'isPending'>
  | Readonly<{ mode: 'live-mock' }>

type QuestionSessionProps = Readonly<{
  model: QuestionSessionModel
  question: Omit<QuestionContentProps, 'interaction'>
  interaction: SessionInteraction
}>

/** Both live modes use this question, answer binding, slide, and navigation surface. */
export const QuestionSession = reatomComponent(
  ({ model, question, interaction }: QuestionSessionProps) => {
    const current = model()

    return (
      <Stack gap={interaction.mode === 'study' ? '24' : '16'} minWidth="0">
        <QuestionSlide
          key={current.key}
          motion={model.motion}
          questionKey={current.key}
          index={current.index}
        >
          <QuestionContent
            {...question}
            interaction={{
              ...interaction,
              isPending: current.isPending,
              onSelect: wrap((option) => {
                void model.answer(option)
              }),
            }}
          />
        </QuestionSlide>
        <QuestionControls model={model} mode={interaction.mode} t={question.t} />
      </Stack>
    )
  },
  'QuestionSession',
)
