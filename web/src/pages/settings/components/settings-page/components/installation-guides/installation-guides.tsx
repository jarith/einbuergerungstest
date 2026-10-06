import { InlineNotice } from '@einbuergerungstest/design-system'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { AppResources } from '../../../../../../app/bootstrap.model'
import { OfflineStatus } from '../../../../../../app/offline'
import { InstallationGuide } from './components/installation-guide/installation-guide'
import { ProgressTransfer } from './components/progress-transfer/progress-transfer'
import { styles } from './installation-guides.styles'

type InstallationGuidesProps = Readonly<{
  localization: AppResources['localization']
  offline: AppResources['offline']
}>

export const InstallationGuides = reatomComponent(
  ({ localization, offline }: InstallationGuidesProps) => (
    <Stack gap="32" css={styles.root}>
      {offline.standalone() ? (
        <InlineNotice intent="success">{localization.t()('installation.installed')}</InlineNotice>
      ) : null}
      <Grid css={styles.columns}>
        <InstallationGuide localization={localization} platform="ios" />
        <InstallationGuide localization={localization} platform="android" />
      </Grid>
      <ProgressTransfer localization={localization} />
      {offline.standalone() ? (
        <Stack as="section" gap="8" aria-labelledby="offline-title">
          <h2 id="offline-title" className={styles.heading}>
            {localization.t()('installation.offlineTitle')}
          </h2>
          <OfflineStatus offline={offline} localization={localization} />
        </Stack>
      ) : null}
    </Stack>
  ),
  'InstallationGuides',
)
