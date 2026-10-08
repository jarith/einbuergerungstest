import type { TFunction } from 'i18next'
import { Button } from '@einbuergerungstest/design-system'
import { Flex } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { QuestionSessionModel } from '../../../../question-session.model'

type QuestionControlsProps = Readonly<{
  model: QuestionSessionModel
  mode: 'study' | 'live-mock'
  t: TFunction
}>

export const QuestionControls = reatomComponent(({ model, mode, t }: QuestionControlsProps) => {
  const current = model()
  const isLast = current.index === current.total - 1
  const iconSize = mode === 'live-mock' ? 16 : 24

  return (
    <Flex
      justify="space-between"
      gap={mode === 'study' ? '12' : '8'}
      wrap={mode === 'study' ? 'wrap' : 'nowrap'}
    >
      <Button
        appearance="outline"
        leftSection={<ArrowLeft size={iconSize} aria-hidden="true" />}
        disabled={current.isPending || current.index <= 0}
        onClick={wrap(() => {
          void model.previous()
        })}
      >
        {t('study.previous')}
      </Button>
      <Button
        rightSection={<ArrowRight size={iconSize} aria-hidden="true" />}
        disabled={current.isPending || (isLast && !current.canFinish)}
        onClick={wrap(() => {
          void model.next()
        })}
      >
        {t(isLast && current.canFinish ? 'study.finish' : 'common.next')}
      </Button>
    </Flex>
  )
}, 'QuestionControls')
