import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { Database } from 'lucide-react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { OfflineStatus } from '../../../../../../app/offline'
import { styles } from '../../dashboard-page.styles'

export const ProgressSummary = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()
  const total = model()

  return (
    <Grid css={{ ...styles.summary }}>
      <Stack gap="12">
        <h2 className={styles.heading}>{t('dashboard.progressTitle')}</h2>
        <p
          className={styles.total}
          aria-label={t('dashboard.contributing', {
            count: total.contributing,
            total: total.total,
          })}
        >
          {total.contributing}/{total.total} · {total.percentage}%
        </p>
        <p>{t(total.attemptCount === 0 ? 'dashboard.firstUse' : 'dashboard.progressHelp')}</p>
      </Stack>
      <Stack gap="12">
        <Database aria-hidden="true" className={styles.icon} />
        <h2 className={styles.heading}>{t('dashboard.savedTitle')}</h2>
        <p>{t('dashboard.savedHelp')}</p>
        <output>{model.online() ? null : t('dashboard.offline')}</output>
        <OfflineStatus offline={model.offline} localization={model.localization} />
      </Stack>
    </Grid>
  )
}, 'ProgressSummary')
