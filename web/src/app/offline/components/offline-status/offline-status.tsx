import { Button, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { AppResources } from '../../../bootstrap.model'

type OfflineStatusProps = Readonly<{
  offline: AppResources['offline']
  localization: AppResources['localization']
}>

export const OfflineStatus = reatomComponent(({ offline, localization }: OfflineStatusProps) => {
  const t = localization.t()
  const status = offline()

  return (
    <Stack gap="12">
      <output>{t(`offline.${status}`)}</output>
      {status === 'error' || status === 'unverified' || status === 'activation-pending' ? (
        <InlineNotice intent={status === 'error' ? 'danger' : 'info'}>
          <Stack gap="12">
            <p>
              {t(
                status === 'error'
                  ? 'offline.failureHelp'
                  : status === 'activation-pending'
                    ? 'offline.activationHelp'
                    : 'offline.verificationHelp',
              )}
            </p>
            {offline.missing().length === 0 ? null : (
              <p>{t('offline.missing', { resources: offline.missing().join(', ') })}</p>
            )}
            <Button
              appearance="outline"
              disabled={offline.pending()}
              onClick={wrap(() => {
                void offline.prepare()
              })}
            >
              {t('common.retry')}
            </Button>
          </Stack>
        </InlineNotice>
      ) : null}
    </Stack>
  )
}, 'OfflineStatus')
