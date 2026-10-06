import type { TFunction } from 'i18next'
import { ButtonLink } from '@einbuergerungstest/design-system'
import { Flex, Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { ArrowRight } from 'lucide-react'

import type { DashboardGroup } from '../../../../../../dashboard.model'
import { QuestionStatusBar } from '../../../../../../../../modules/learner-state'
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
        <QuestionStatusBar group={group} t={t} />
        {group.resumePosition === null ? null : (
          <p id={`group-resume-${group.id}`} className={styles.resume}>
            {t('groups.resumePosition', { position: group.resumePosition, total: group.total })}
          </p>
        )}
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
  </Grid>
)
