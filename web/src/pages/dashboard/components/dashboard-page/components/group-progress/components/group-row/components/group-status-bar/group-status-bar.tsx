import type { TFunction } from 'i18next'
import { Tooltip } from '@einbuergerungstest/design-system'

import type { DashboardGroup } from '../../../../../../../../dashboard.model'
import { getStatusSegments } from '../../../../../../../../lib/status-segments'
import { progressStatus } from '../../../../../../progress-status.recipe'
import { GroupStatusDetails } from './components/group-status-details/group-status-details'
import { styles } from './group-status-bar.styles'

type GroupStatusBarProps = Readonly<{ group: DashboardGroup; t: TFunction }>

/* oxlint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-tabindex -- The SVG is a named chart; focus exposes its status tooltip to keyboard users. */
export const GroupStatusBar = ({ group, t }: GroupStatusBarProps) => {
  const segments = getStatusSegments(group)

  const description = segments
    .map((segment) =>
      t('questions.filterCount', { status: t(`progress.${segment.status}`), count: segment.count }),
    )
    .join('. ')

  return (
    <Tooltip label={<GroupStatusDetails group={group} t={t} />}>
      <svg
        role="img"
        tabIndex={0}
        aria-label={`${group.title}. ${description}`}
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className={styles.root}
      >
        {segments.flatMap((segment) =>
          segment.count === 0
            ? []
            : [
                <rect
                  key={segment.status}
                  className={progressStatus({ status: segment.status })}
                  x={segment.offset * 100}
                  y={0}
                  width={segment.portion * 100}
                  height={8}
                  fill="currentColor"
                />,
              ],
        )}
      </svg>
    </Tooltip>
  )
}
