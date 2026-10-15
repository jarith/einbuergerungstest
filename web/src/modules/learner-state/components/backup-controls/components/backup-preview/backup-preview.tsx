import { Button, Panel } from '@einbuergerungstest/design-system'
import { Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { BackupControlsProps } from '../../backup-controls'
import { styles } from '../../backup-controls.styles'

export const BackupPreview = reatomComponent(
  ({ learner, localization, model }: BackupControlsProps) => {
    const preview = model()
    const current = learner()
    const t = localization.t()

    if (preview?.kind !== 'import' || current === null) {
      return null
    }

    const date = (value: string | null) =>
      value === null ? t('settings.none') : localization.formatPlannedDate(value)

    const languageLabels = {
      en: 'settings.english',
      de: 'settings.german',
      ru: 'settings.russian',
    } as const

    const rows = [
      [t('settings.studyAttempts'), preview.studyAttempts, current.studyAttempts.length],
      [
        t('settings.completedTests'),
        preview.completedMocks,
        learner.progress.mockTotals().completed,
      ],
      [
        t('settings.unfinishedTests'),
        preview.unfinishedMocks,
        current.mockSittings.filter((sitting) => sitting.status !== 'completed').length,
      ],
      [
        t('settings.plannedDate'),
        date(preview.preferences.plannedTestDate),
        date(current.preferences.plannedTestDate),
      ],
      [
        t('settings.language'),
        t(languageLabels[preview.preferences.language]),
        t(languageLabels[current.preferences.language]),
      ],
      [
        t('settings.studyTranslation'),
        t(preview.preferences.studyTranslation ? 'settings.on' : 'settings.off'),
        t(current.preferences.studyTranslation ? 'settings.on' : 'settings.off'),
      ],
      [
        t('settings.appearance'),
        t(preview.preferences.appearance === 'light' ? 'settings.light' : 'settings.dark'),
        t(current.preferences.appearance === 'light' ? 'settings.light' : 'settings.dark'),
      ],
    ]

    return (
      <Panel tone="muted">
        <p className={styles.helper}>{t('settings.validBackup')}</p>
        <h3 className={styles.heading}>{t('settings.preview')}</h3>
        <p>{t('settings.previewHelp')}</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t('settings.data')}</th>
              <th scope="col">{t('settings.selectedBackup')}</th>
              <th scope="col">{t('settings.thisDevice')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, backup, device]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{backup}</td>
                <td>{device}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{t('dialogs.importBody')}</p>
        <Wrap gap="8">
          <Button appearance="outline" onClick={wrap(model.cancel)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={wrap(model.requestImport)}>{t('settings.import')}</Button>
        </Wrap>
      </Panel>
    )
  },
  'BackupPreview',
)
