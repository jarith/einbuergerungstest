import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { OfflineStatus } from '../../../../../../app/offline'
import { styles } from '../../dashboard-page.styles'

export const SavedProgress = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()

  return (
    <Stack css={{ ...styles.saved }}>
      <h2 className={styles.savedTitle}>{t('dashboard.savedTitle')}</h2>
      <p className={styles.caption}>{t('dashboard.savedHelp')}</p>
      {model.online() ? null : <output>{t('dashboard.offline')}</output>}
      <OfflineStatus offline={model.offline} localization={model.localization} />
    </Stack>
  )
}, 'SavedProgress')
