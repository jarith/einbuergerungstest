import { cx } from '@einbuergerungstest/design-system'
import { Grid } from '@einbuergerungstest/design-system/jsx'

import type { LearningStatus } from '../../../../../../../../modules/learner-state'
import { progressStatus } from '../../../../progress-status.recipe'
import { styles } from './progress-legend.styles'

export type ProgressLegendItem = Readonly<{
  status: LearningStatus
  label: string
  count: string
  percentage: string
  description: string
}>

type ProgressLegendProps = Readonly<{
  items: readonly ProgressLegendItem[]
  highlighted: LearningStatus | null
  selected: LearningStatus | null
  onPreview: (status: LearningStatus | null) => void
  onToggle: (status: LearningStatus) => void
}>

export const ProgressLegend = ({
  items,
  highlighted,
  selected,
  onPreview,
  onToggle,
}: ProgressLegendProps) => (
  <Grid css={styles.root} data-progress-interaction>
    {items.map((item) => (
      <button
        key={item.status}
        type="button"
        className={styles.item}
        data-highlighted={highlighted === item.status}
        aria-label={item.description}
        aria-pressed={selected === item.status}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') {
            onPreview(item.status)
          }
        }}
        onPointerLeave={() => onPreview(null)}
        onPointerCancel={() => onPreview(null)}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) {
            onPreview(item.status)
          }
        }}
        onBlur={() => onPreview(null)}
        onClick={(event) => {
          if (
            event.detail === 0 ||
            (event.nativeEvent instanceof PointerEvent && event.nativeEvent.pointerType === 'touch')
          ) {
            onToggle(item.status)
          }
        }}
      >
        <span
          className={cx(styles.dot, progressStatus({ status: item.status }))}
          aria-hidden="true"
        />
        <span className={styles.text}>
          <span>{item.label}</span>
          <span className={styles.values}>
            <span className={styles.count}>{item.count}</span>
            <span className={styles.separator} aria-hidden="true">
              ·
            </span>
            <span className={styles.percentage}>{item.percentage}%</span>
          </span>
        </span>
      </button>
    ))}
  </Grid>
)
