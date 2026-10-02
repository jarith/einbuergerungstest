import { Button } from '@einbuergerungstest/design-system'
import { Flex, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'

import type { StudySessionProps } from '../study-session/study-session'

export const StudyControls = reatomComponent(({ model }: StudySessionProps) => {
  const current = model()
  const t = model.localization.t()
  const isPending = model.flow.pending()

  return (
    <Flex justify="space-between" gap="12" wrap="wrap">
      <Wrap gap="8">
        {current.index > 0 || current.selectedOption === null ? (
          <Button
            appearance="outline"
            leftSection={<ArrowLeft aria-hidden="true" />}
            disabled={isPending || current.index === 0}
            onClick={wrap(() => {
              void model.previous()
            })}
          >
            {t('study.previous')}
          </Button>
        ) : null}
        {current.selectedOption !== null ? (
          <Button
            appearance="outline"
            leftSection={<RotateCcw aria-hidden="true" />}
            disabled={isPending}
            onClick={wrap(model.flow.retry)}
          >
            {t('study.retryQuestion')}
          </Button>
        ) : null}
      </Wrap>
      <Button
        rightSection={<ArrowRight aria-hidden="true" />}
        disabled={isPending}
        onClick={wrap(() => {
          void model.next()
        })}
      >
        {t(current.index === current.total - 1 ? 'study.finish' : 'common.next')}
      </Button>
    </Flex>
  )
}, 'StudyControls')
