import { Button, Dialog, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { BackupControlsProps } from '../../backup-controls'

export const ReplacementDialog = reatomComponent(({ localization, model }: BackupControlsProps) => {
  const t = localization.t()
  const isReset = model()?.kind === 'reset'
  const isPending = model.pending()

  return (
    <Dialog
      opened={model.isConfirming()}
      onClose={wrap(() => {
        if (!isPending) {
          model.cancel()
        }
      })}
      title={t(isReset ? 'dialogs.resetTitle' : 'dialogs.importTitle')}
      closeButtonProps={{ 'aria-label': t('common.close'), disabled: isPending }}
      closeOnEscape={!isPending}
      closeOnClickOutside={!isPending}
    >
      <Stack gap="layout.section">
        <p>{t(isReset ? 'dialogs.resetBody' : 'dialogs.importBody')}</p>
        {model.message() === 'storage' ? (
          <InlineNotice intent="danger">{t('errors.storage')}</InlineNotice>
        ) : null}
        <Wrap gap="8">
          <Button
            appearance="outline"
            data-autofocus
            disabled={isPending}
            onClick={wrap(model.cancel)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            appearance="outline"
            disabled={isPending}
            onClick={wrap(() => {
              void model.confirm()
            })}
          >
            {t(isReset ? 'settings.reset' : 'settings.import')}
          </Button>
        </Wrap>
      </Stack>
    </Dialog>
  )
}, 'ReplacementDialog')
