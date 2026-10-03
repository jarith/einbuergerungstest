import { Button, Dialog } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Check, X } from 'lucide-react'

import type { TestReviewModel } from '../../../../test-review.model'

type ReviewPickerProps = Readonly<{ model: TestReviewModel }>

export const ReviewPicker = reatomComponent(({ model }: ReviewPickerProps) => {
  const { index: current } = model()
  const t = model.localization.t()

  return (
    <Dialog
      opened={model.picker()}
      onClose={wrap(model.closePicker)}
      title={t('mock.questionList')}
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Stack gap="8">
        {model.entries().map(({ key, index, feedback, isAnswered }) => {
          const result = t(
            feedback === 'correct'
              ? 'study.correct'
              : feedback === 'incorrect'
                ? 'study.mistaken'
                : feedback === 'unanswered' || !isAnswered
                  ? 'mock.unanswered'
                  : 'mock.answered',
          )

          return (
            <Button
              key={key}
              appearance={index === current ? 'solid' : 'outline'}
              aria-current={index === current ? 'step' : undefined}
              onClick={wrap(() => model.go(index))}
              leftSection={
                feedback !== 'hidden' ? (
                  feedback === 'correct' ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <X size={16} aria-hidden="true" />
                  )
                ) : undefined
              }
            >
              {t('common.questionPosition', { current: index + 1, total: 33 })} · {result}
            </Button>
          )
        })}
      </Stack>
    </Dialog>
  )
}, 'ReviewPicker')
