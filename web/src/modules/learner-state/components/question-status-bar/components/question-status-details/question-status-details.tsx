import type { TFunction } from 'i18next'
import { cx } from '@einbuergerungstest/design-system'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'

import type { QuestionTotals } from '../../../../domain/question-progress'
import { getStatusSegments } from '../../../../domain/status-segments'
import { progressStatus } from '../../../progress-status.recipe'
import { styles } from './question-status-details.styles'

type QuestionStatusDetailsProps = Readonly<{
  group: QuestionTotals & Readonly<{ title: string; percentageLabel: string }>
  t: TFunction
}>

export const QuestionStatusDetails = ({ group, t }: QuestionStatusDetailsProps) => (
  <Stack gap="8">
    <strong>{group.title}</strong>
    <p className={styles.summary}>
      {t('dashboard.groupCount', { count: group.contributing, total: group.total })}
      {' · '}
      {group.percentageLabel}%
    </p>
    <Stack as="ul" gap="8" css={styles.list}>
      {getStatusSegments(group).map((segment) => (
        <Grid as="li" key={segment.status} css={styles.row}>
          <span
            className={cx(styles.dot, progressStatus({ status: segment.status }))}
            aria-hidden="true"
          />
          <span>{t(`progress.${segment.status}`)}</span>
          <span className={styles.count}>{segment.count}</span>
          <span className={styles.percentage}>{Math.round(segment.portion * 100)}%</span>
        </Grid>
      ))}
    </Stack>
  </Stack>
)
