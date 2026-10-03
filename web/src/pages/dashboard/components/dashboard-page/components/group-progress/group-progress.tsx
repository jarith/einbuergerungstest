import { ProgressBar } from '@einbuergerungstest/design-system'
import { Flex, Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { styles } from '../../dashboard-page.styles'

export const GroupProgress = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()

  return (
    <Stack as="section" gap="16" aria-labelledby="group-progress-title">
      <Flex justify="space-between" gap="16" wrap="wrap">
        <h2 id="group-progress-title" className={styles.heading}>
          {t('dashboard.groupTitle')}
        </h2>
        <a className={styles.link} href="/study/groups">
          {t('navigation.groups')} →
        </a>
      </Flex>
      <p className={styles.caption}>{t('dashboard.progressHelp')}</p>
      <Grid css={{ ...styles.groups }}>
        {model.groups().map((group) => (
          <Stack key={group.id} gap="8" className={styles.group}>
            <p className={styles.groupTitle}>{group.title}</p>
            <Flex justify="space-between" gap="8" className={styles.caption}>
              <span>
                {t('dashboard.groupCount', { count: group.contributing, total: group.total })}
              </span>
              <span>{group.percentage}%</span>
            </Flex>
            <ProgressBar aria-label={group.title} value={group.percentage} />
          </Stack>
        ))}
      </Grid>
    </Stack>
  )
}, 'GroupProgress')
