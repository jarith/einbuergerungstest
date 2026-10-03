import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { styles } from '../../dashboard-page.styles'
import { GroupRow } from './components/group-row/group-row'

export const GroupProgress = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()

  return (
    <Stack
      as="section"
      gap="8"
      css={{ ...styles.groupSection }}
      aria-labelledby="group-progress-title"
    >
      <h2 id="group-progress-title" className={styles.heading}>
        {t('dashboard.groupTitle')}
      </h2>
      <p className={styles.caption}>{t('dashboard.progressHelp')}</p>
      <Stack as="ul" css={{ ...styles.groups }}>
        {model.groups().map((group) => (
          <GroupRow key={group.id} group={group} t={t} />
        ))}
      </Stack>
    </Stack>
  )
}, 'GroupProgress')
