import type { TFunction } from 'i18next'
import { ButtonLink, ProgressBar } from '@einbuergerungstest/design-system'
import { Flex, Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { ArrowRight } from 'lucide-react'

import type { DashboardGroup } from '../../../../../../dashboard.model'
import { styles } from './group-row.styles'

type GroupRowProps = Readonly<{ group: DashboardGroup; t: TFunction }>

export const GroupRow = ({ group, t }: GroupRowProps) => (
  <Grid as="li" css={{ ...styles.row }}>
    <Stack gap="4" minWidth="0" css={{ ...styles.identity }}>
      <h3 id={`group-${group.id}`} className={styles.title}>
        {group.title}
      </h3>
      <p className={styles.description}>{group.description}</p>
    </Stack>
    <Grid css={{ ...styles.controls }}>
      <Stack gap="8" minWidth="0" css={{ ...styles.progress }}>
        <Flex justify="space-between" align="center" gap="8">
          <span className={styles.metadata}>
            {t('dashboard.groupCount', { count: group.contributing, total: group.total })}
          </span>
          <span className={styles.percentage}>{group.percentageLabel}%</span>
        </Flex>
        <ProgressBar
          aria-label={group.title}
          aria-valuenow={group.contributing}
          aria-valuemax={group.total}
          aria-valuetext={t('dashboard.groupCount', {
            count: group.contributing,
            total: group.total,
          })}
          value={group.progressValue}
        />
      </Stack>
      <ButtonLink
        className={styles.action}
        appearance="outline"
        href={group.href}
        aria-labelledby={`group-action-${group.id} group-${group.id}`}
        aria-describedby={group.resumePosition === null ? undefined : `group-resume-${group.id}`}
        rightSection={<ArrowRight aria-hidden="true" />}
      >
        <span id={`group-action-${group.id}`}>{t(group.action)}</span>
      </ButtonLink>
    </Grid>
    {group.resumePosition === null ? null : (
      <p id={`group-resume-${group.id}`} className={styles.resume}>
        {t('groups.resumePosition', { position: group.resumePosition, total: group.total })}
      </p>
    )}
  </Grid>
)
