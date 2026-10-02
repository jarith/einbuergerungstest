import { InlineNotice } from '@einbuergerungstest/design-system'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import { InstallationSteps } from './components/installation-steps/installation-steps'
import { ProgressTransfer } from './components/progress-transfer/progress-transfer'
import { styles } from './installation-page.styles'

export const InstallationPage = reatomComponent(({ data }: PageProps) => {
  const t = data.localization.t()

  return (
    <Stack gap="24" css={styles.root}>
      <p className={styles.eyebrow}>{t('installation.context')}</p>
      <h1 className={styles.title}>{t('installation.title')}</h1>
      <p>{t('installation.description')}</p>
      {data.offline.standalone() ? (
        <InlineNotice intent="success">{t('installation.installed')}</InlineNotice>
      ) : null}
      <Grid css={styles.columns}>
        <InstallationSteps localization={data.localization} />
        <ProgressTransfer localization={data.localization} />
      </Grid>
      <Stack as="section" gap="8" aria-labelledby="offline-title">
        <h2 id="offline-title" className={styles.heading}>
          {t('installation.offlineTitle')}
        </h2>
        <output>
          {t(data.offline() === 'ready' ? 'installation.ready' : 'installation.notReady')}
        </output>
      </Stack>
    </Stack>
  )
}, 'InstallationPage')
