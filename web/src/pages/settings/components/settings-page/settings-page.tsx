import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { SettingsData } from '../../settings.model'
import { BackupControls } from '../../../../modules/learner-state'
import { InstallationGuides } from './components/installation-guides/installation-guides'
import { PreferencesSection } from './components/preferences-section/preferences-section'
import { styles } from './settings-page.styles'

export const SettingsPage = reatomComponent(
  ({ data }: PageProps<SettingsData>) => (
    <Stack gap="layout.section" css={{ ...styles.root }}>
      <p>{data.localization.t()('settings.description')}</p>
      <PreferencesSection data={data} />
      <BackupControls
        learner={data.learner}
        localization={data.localization}
        model={data.settings.backup}
      />
      <InstallationGuides localization={data.localization} offline={data.offline} />
      <p>
        {data.localization.t()('settings.version', {
          version: import.meta.env['VITE_APP_VERSION'],
        })}
      </p>
    </Stack>
  ),
  'SettingsPage',
)
