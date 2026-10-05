import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'

import type { LearningStatus } from '../../../../../../../../modules/learner-state'
import type { StatusSegment } from '../../../../../../lib/status-segments'
import { progressStatus } from '../../../../progress-status.recipe'
import { styles } from './progress-donut.styles'

type ProgressDonutProps = Readonly<{
  segments: readonly StatusSegment[]
  highlighted: LearningStatus | null
  label: string
  description: string
  percentage: string
  count: string
  meaning: string
}>

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The inline SVG is a dynamically rendered, named chart. */
export const ProgressDonut = ({
  segments,
  highlighted,
  label,
  description,
  percentage,
  count,
  meaning,
}: ProgressDonutProps) => {
  const hasHighlight = segments.some(
    (segment) => segment.status === highlighted && segment.count > 0,
  )

  return (
    <Grid css={styles.root} data-progress-interaction>
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${label}. ${description}`}
        className={styles.svg}
      >
        {segments.flatMap((segment) => {
          const active = segment.status === highlighted
          const thickness = active ? 21 : 13

          return segment.count === 0
            ? []
            : [
                <circle
                  key={segment.status}
                  className={progressStatus({ status: segment.status })}
                  cx={100}
                  cy={100}
                  r={100 - thickness / 2}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={thickness}
                  pathLength={1}
                  strokeDasharray={`${segment.portion} ${1 - segment.portion}`}
                  strokeDashoffset={-segment.offset}
                  transform="rotate(-90 100 100)"
                  opacity={hasHighlight && !active ? 0.35 : 1}
                />,
              ]
        })}
      </svg>
      <Stack gap="4" css={styles.center} aria-hidden="true">
        <span className={styles.percentage}>{percentage}%</span>
        <span className={styles.count}>{count}</span>
        <span className={styles.meaning}>{meaning}</span>
      </Stack>
    </Grid>
  )
}
