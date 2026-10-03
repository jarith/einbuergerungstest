import type { TFunction } from 'i18next'
import { Button, FileInput, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Download } from 'lucide-react'

import type { createBackupModel } from '../../application/backup.model'
import type { createLearnerState } from '../../application/learner-state.model'
import { styles } from './backup-controls.styles'
import { BackupPreview } from './components/backup-preview/backup-preview'
import { ReplacementDialog } from './components/replacement-dialog/replacement-dialog'

export type BackupControlsProps = Readonly<{
  learner: ReturnType<typeof createLearnerState>
  localization: Readonly<{ t: () => TFunction; formatPlannedDate: (date: string) => string }>
  model: ReturnType<typeof createBackupModel>
}>

export const BackupControls = reatomComponent((props: BackupControlsProps) => {
  const { localization, model } = props
  const t = localization.t()
  const message = model.message()

  return (
    <Stack gap="layout.section">
      <Stack as="section" gap="24" aria-labelledby="backup-title">
        <h2 id="backup-title" className={styles.heading}>
          {t('settings.backup')}
        </h2>
        <Stack gap="12" alignItems="start">
          <p>{t('settings.exportHelp')}</p>
          <Button
            appearance="outline"
            disabled={model.pending()}
            leftSection={<Download aria-hidden="true" />}
            onClick={wrap(() => {
              void model.download()
            })}
          >
            {t('settings.export')}
          </Button>
        </Stack>
        <Stack gap="16">
          <FileInput
            label={t('settings.backupFile')}
            placeholder={t('settings.chooseFile')}
            accept="application/json,.json"
            value={model.file()}
            disabled={model.pending()}
            onChange={wrap((file) => {
              void model.selectFile(file)
            })}
          />
          {message === 'invalid' ? (
            <InlineNotice intent="danger">{t('validation.invalidBackup')}</InlineNotice>
          ) : null}
          <BackupPreview {...props} />
        </Stack>
      </Stack>
      <Stack gap="12" alignItems="start">
        <Button appearance="outline" disabled={model.pending()} onClick={wrap(model.requestReset)}>
          {t('settings.reset')}
        </Button>
        <p className={styles.helper}>{t('settings.resetHelp')}</p>
      </Stack>
      <output>
        {model.pending() ? t('common.saving') : null}
        {message === 'exported' ? t('settings.exported') : null}
        {message === 'replaced' ? t('settings.replaced') : null}
      </output>
      {message === 'storage' || message === 'conflict' ? (
        <InlineNotice intent="danger">
          {t(message === 'conflict' ? 'errors.storageConflict' : 'errors.storage')}
        </InlineNotice>
      ) : null}
      <ReplacementDialog {...props} />
    </Stack>
  )
}, 'BackupControls')
