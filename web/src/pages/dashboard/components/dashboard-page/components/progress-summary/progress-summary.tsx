import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { onEvent, wrap } from '@reatom/core'
import { reatomFactoryComponent } from '@reatom/react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { getStatusSegments } from '../../../../../../modules/learner-state'
import { ProgressDonut } from './components/progress-donut/progress-donut'
import { ProgressLegend } from './components/progress-legend/progress-legend'
import { createProgressHighlight } from './progress-highlight.model'
import { styles } from './progress-summary.styles'

export const ProgressSummary = reatomFactoryComponent<DashboardSectionProps>(() => {
  const highlight = createProgressHighlight()

  const bindDismissal = (element: HTMLDivElement | null) => {
    if (element === null) {
      return undefined
    }

    const offPointer = onEvent(element.ownerDocument, 'pointerdown', (event) => {
      if (
        event.target instanceof Element &&
        !element.contains(event.target.closest('[data-progress-interaction]'))
      ) {
        highlight.clear()
      }
    })

    const offKeyboard = onEvent(element.ownerDocument, 'keydown', (event) => {
      if (event.key === 'Escape') {
        highlight.clear()
      }
    })

    return () => {
      offPointer()

      offKeyboard()
    }
  }

  return ({ model }) => {
    const t = model.localization.t()
    const total = model()
    const segments = getStatusSegments(total)

    const items = segments.map((segment) => {
      const label = t(`progress.${segment.status}`)
      const count = model.localization.formatNumber(segment.count)
      const percentage = model.localization.formatNumber(Math.round(segment.portion * 100))

      return {
        status: segment.status,
        label,
        count,
        percentage,
        description: `${label}: ${count} · ${percentage}%`,
      }
    })

    const description = [
      t('dashboard.contributing', { count: total.contributing, total: total.total }),
      `${total.percentageLabel}%`,
      ...items.map((item) => item.description),
    ].join('. ')

    return (
      <Stack css={styles.root}>
        <Flex css={styles.chartAndLegend} ref={wrap(bindDismissal)}>
          <ProgressDonut
            segments={segments}
            highlighted={highlight()}
            label={t('dashboard.progressTitle')}
            description={description}
            percentage={total.percentageLabel}
            count={`${model.localization.formatNumber(total.contributing)} / ${model.localization.formatNumber(total.total)}`}
            meaning={t('dashboard.contributingShort')}
          />
          <ProgressLegend
            items={items}
            highlighted={highlight()}
            selected={highlight.selected()}
            onPreview={wrap(highlight.preview)}
            onToggle={wrap(highlight.toggle)}
          />
        </Flex>
        {total.attemptCount === 0 ? (
          <p className={styles.caption}>{t('dashboard.firstUse')}</p>
        ) : null}
      </Stack>
    )
  }
}, 'ProgressSummary')
