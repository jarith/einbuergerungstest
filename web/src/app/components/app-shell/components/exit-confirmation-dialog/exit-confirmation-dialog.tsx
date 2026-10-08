import { Button, Dialog, InlineNotice } from '@einbuergerungstest/design-system'
import { Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { AppResources } from '../../../../bootstrap.model'
import { isLearnerStateConflict } from '../../../../../modules/learner-state'
import { browserNavigationAtom } from '../../../../../shared/navigation/browser-navigation.model'
import { PendingNotice } from '../../../pending-notice/pending-notice'

type ExitConfirmationDialogProps = Readonly<{ localization: AppResources['localization'] }>

export const ExitConfirmationDialog = reatomComponent(
  ({ localization }: ExitConfirmationDialogProps) => {
    const t = localization.t()
    const isPending = browserNavigationAtom.confirm.pending() > 0
    const error = browserNavigationAtom.error()
    const hasStorageConflict = isLearnerStateConflict(error)

    return (
      <Dialog
        opened={browserNavigationAtom()}
        onClose={wrap(() => {
          if (!isPending) {
            browserNavigationAtom.cancel()
          }
        })}
        title={t('dialogs.exitTitle')}
        closeButtonProps={{ 'aria-label': t('common.close'), disabled: isPending }}
      >
        <p>{t('dialogs.exitBody')}</p>
        <div aria-live="polite" aria-atomic="true">
          {isPending ? (
            <PendingNotice message={t('common.saving')} longWaitMessage={t('common.savingSlow')} />
          ) : null}
        </div>
        {error === undefined ? null : (
          <InlineNotice intent="danger" role="alert">
            {t(hasStorageConflict ? 'errors.storageConflict' : 'errors.storage')}
          </InlineNotice>
        )}
        <Wrap gap="layout.inline" marginTop="24">
          <Button
            appearance="outline"
            data-autofocus
            disabled={isPending}
            onClick={wrap(() => browserNavigationAtom.cancel())}
          >
            {t('mock.stay')}
          </Button>
          <Button
            disabled={isPending}
            aria-busy={isPending}
            onClick={wrap(() => {
              if (hasStorageConflict) {
                location.reload()
              } else {
                void browserNavigationAtom.confirm()
              }
            })}
          >
            {isPending ? t('common.saving') : t(hasStorageConflict ? 'common.reload' : 'mock.exit')}
          </Button>
        </Wrap>
      </Dialog>
    )
  },
  'ExitConfirmationDialog',
)
