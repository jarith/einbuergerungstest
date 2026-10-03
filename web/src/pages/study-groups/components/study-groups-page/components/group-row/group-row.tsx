import type { TFunction } from 'i18next'
import { Divider } from '@einbuergerungstest/design-system'
import { Flex, Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { ArrowRight } from 'lucide-react'

import type { StudyGroupItem } from '../../../../study-groups.model'
import { styles as pageStyles } from '../../study-groups-page.styles'
import { styles } from './group-row.styles'

type GroupRowProps = Readonly<{ group: StudyGroupItem; t: TFunction }>

export const GroupRow = ({ group, t }: GroupRowProps) => (
  <Stack as="li" gap="0" minWidth="0">
    <Grid css={{ ...styles.row }}>
      <span className={styles.number} aria-hidden="true">
        {group.number}
      </span>
      <Stack gap="8" minWidth="0">
        <h3 id={`group-${group.id}`} className={styles.title}>
          {group.title}
        </h3>
        <p className={styles.description}>{group.description}</p>
        <Flex gap="8" wrap="wrap" justify="space-between" className={styles.metadata}>
          <span>{t('groups.questionCount', { count: group.total })}</span>
          <span>
            {t('dashboard.groupCount', { count: group.contributing, total: group.total })} ·{' '}
            {group.percentage}%
          </span>
        </Flex>
        <a className={pageStyles.link} href={group.href} aria-describedby={`group-${group.id}`}>
          <span>{t(group.action)}</span>
          <ArrowRight aria-hidden="true" />
        </a>
      </Stack>
    </Grid>
    <Divider />
  </Stack>
)
