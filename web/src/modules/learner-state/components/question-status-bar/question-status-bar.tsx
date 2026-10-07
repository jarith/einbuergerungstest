import type { TFunction } from 'i18next'
import { Tooltip } from '@einbuergerungstest/design-system'

import type { QuestionTotals } from '../../domain/question-progress'
import { getStatusSegments } from '../../domain/status-segments'
import { progressStatus } from '../progress-status.recipe'
import { QuestionStatusDetails } from './components/question-status-details/question-status-details'
import { styles } from './question-status-bar.styles'

type QuestionStatusBarProps = Readonly<{
  group: QuestionTotals & Readonly<{ title: string; percentageLabel: string }>
  t: TFunction
  focusable?: boolean
}>

/* oxlint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-tabindex -- The SVG is a named chart; focus exposes its status tooltip to keyboard users. */
export const QuestionStatusBar = ({ group, t, focusable = true }: QuestionStatusBarProps) => {
  const segments = getStatusSegments(group)

  const description = segments
    .map((segment) =>
      t('questions.filterCount', { status: t(`progress.${segment.status}`), count: segment.count }),
    )
    .join('. ')

  return (
    <Tooltip label={<QuestionStatusDetails group={group} t={t} />}>
      <svg
        role="img"
        tabIndex={focusable ? 0 : undefined}
        aria-label={`${group.title}. ${description}`}
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className={styles.root}
      >
        {segments.map((segment) => (
          <rect
            key={segment.status}
            className={progressStatus({ status: segment.status })}
            style={{ x: `${segment.offset * 100}%`, width: `${segment.portion * 100}%` }}
            y={0}
            height={8}
            fill="currentColor"
          />
        ))}
      </svg>
    </Tooltip>
  )
}
