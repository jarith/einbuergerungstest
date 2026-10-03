import { Button, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { createStartupRecovery } from '../../../modules/learner-state'
import en from '../../i18n/en.json'
import { StartupResetDialog } from './components/startup-reset-dialog/startup-reset-dialog'

export type StartupRecoveryProps = Readonly<{
  model: ReturnType<typeof createStartupRecovery>
}>

export const StartupRecovery = reatomComponent(
  ({ model }: StartupRecoveryProps) => (
    <Stack gap="layout.section">
      <InlineNotice intent="danger" role="alert">
        <h1>{en.startupRecovery.title}</h1>
        <p>{en.startupRecovery.body}</p>
      </InlineNotice>
      <p>{en.startupRecovery.backupHelp}</p>
      <Wrap gap="8">
        <Button appearance="outline" onClick={wrap(model.download)} disabled={model.pending()}>
          {en.startupRecovery.download}
        </Button>
        <Button onClick={wrap(model.requestReset)} disabled={model.pending()}>
          {en.startupRecovery.startFresh}
        </Button>
        <Button appearance="outline" onClick={() => location.reload()} disabled={model.pending()}>
          {en.common.reload}
        </Button>
      </Wrap>
      <StartupResetDialog model={model} />
    </Stack>
  ),
  'StartupRecovery',
)
