import { Button, FileInput, InlineNotice, Panel } from '@einbuergerungstest/design-system'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Download } from 'lucide-react'

import type { AppResources } from '../../../../app/bootstrap.model'
import type { createBackupModel } from '../../application/backup.model'
import { styles } from './backup-controls.styles'
import { BackupPreview } from './components/backup-preview/backup-preview'
import { ReplacementDialog } from './components/replacement-dialog/replacement-dialog'

export type BackupControlsProps = Readonly<{
  learner: AppResources['learner']
  localization: AppResources['localization']
  model: ReturnType<typeof createBackupModel>
}>

export const BackupControls = reatomComponent((props: BackupControlsProps) => {
  const { localization, model } = props
  const t = localization.t()
  const message = model.message()

  return (
    <Stack gap="layout.section">
      <Grid css={{ ...styles.columns }}>
        <Stack gap="layout.section">
          <Panel>
            <h2 className={styles.heading}>{t('settings.exportTitle')}</h2>
            <p>{t('settings.exportHelp')}</p>
            <Button
              disabled={model.pending()}
              leftSection={<Download aria-hidden="true" />}
              onClick={wrap(() => {
                void model.download()
              })}
            >
              {t('settings.export')}
            </Button>
          </Panel>
          <Panel>
            <h2 className={styles.heading}>{t('settings.import')}</h2>
            <FileInput
              label={t('settings.importHelp')}
              placeholder={t('settings.chooseFile')}
              accept="application/json,.json"
              value={model.file()}
              disabled={model.pending()}
              onChange={wrap((file) => {
                void model.selectFile(file)
              })}
            />
          </Panel>
        </Stack>
        <Stack gap="layout.section">
          <BackupPreview {...props} />
          <Button
            appearance="outline"
            disabled={model.pending()}
            onClick={wrap(model.requestReset)}
          >
            {t('settings.reset')}
          </Button>
          <p className={styles.helper}>{t('settings.resetHelp')}</p>
        </Stack>
      </Grid>
      <output>
        {model.pending() ? t('common.saving') : null}
        {message === 'exported' ? t('settings.exported') : null}
        {message === 'replaced' ? t('settings.replaced') : null}
      </output>
      {message === 'invalid' || message === 'storage' ? (
        <InlineNotice intent="danger">
          {t(message === 'invalid' ? 'validation.invalidBackup' : 'errors.storage')}
        </InlineNotice>
      ) : null}
      <ReplacementDialog {...props} />
    </Stack>
  )
}, 'BackupControls')
