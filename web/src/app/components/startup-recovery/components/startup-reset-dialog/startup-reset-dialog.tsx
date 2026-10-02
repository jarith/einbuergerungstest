import { Button, Dialog, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { StartupRecoveryProps } from '../../startup-recovery'
import en from '../../../../i18n/en.json'

export const StartupResetDialog = reatomComponent(({ model }: StartupRecoveryProps) => {
  const isPending = model.pending()

  return (
    <Dialog
      opened={model.confirmation() !== null}
      onClose={wrap(() => {
        if (!isPending) {
          model.cancel()
        }
      })}
      title={en.startupRecovery.resetTitle}
      closeButtonProps={{ 'aria-label': en.common.close, disabled: isPending }}
      closeOnEscape={!isPending}
      closeOnClickOutside={!isPending}
    >
      <Stack gap="layout.section">
        <p>{en.startupRecovery.resetBody}</p>
        {model.message() !== null ? (
          <InlineNotice intent="danger" role="alert">
            {model.message() === 'conflict' ? en.errors.storageConflict : en.errors.storage}
            <Button appearance="outline" onClick={() => location.reload()}>
              {en.common.reload}
            </Button>
          </InlineNotice>
        ) : null}
        <Wrap gap="8">
          <Button
            appearance="outline"
            data-autofocus
            disabled={isPending}
            onClick={wrap(model.cancel)}
          >
            {en.common.cancel}
          </Button>
          <Button
            appearance="danger"
            disabled={isPending}
            onClick={wrap(() => {
              void model.confirm()
            })}
          >
            {en.startupRecovery.reset}
          </Button>
        </Wrap>
      </Stack>
    </Dialog>
  )
}, 'StartupResetDialog')
