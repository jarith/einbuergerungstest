import {
  IconButton,
  InlineNotice,
  Panel,
  SegmentedChoice,
  TextInput,
} from '@einbuergerungstest/design-system'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { X } from 'lucide-react'

import type { PageProps } from '../../../../../../app/routing'
import type { SettingsData } from '../../../../settings.model'
import { getLocalDate } from '../../../../../../modules/learner-state'
import { styles } from '../../settings-page.styles'

export const PreferencesSection = reatomComponent(({ data }: PageProps<SettingsData>) => {
  const { settings, localization } = data
  const t = localization.t()
  const preferences = settings()
  const validation = settings.date.validation()

  return (
    <Panel edge="plain">
      <h2 className={styles.heading}>{t('settings.preferences')}</h2>
      <Grid css={{ ...styles.columns }} gap="24">
        <Stack gap="8">
          <p className={styles.label}>{t('settings.language')}</p>
          <p className={styles.helper}>{t('settings.languageHelp')}</p>
          <SegmentedChoice
            aria-label={t('settings.language')}
            value={preferences?.language ?? 'en'}
            disabled={settings.pending()}
            data={[
              { value: 'en', label: 'English' },
              { value: 'de', label: 'Deutsch' },
            ]}
            onChange={wrap(settings.setLanguage)}
          />
        </Stack>
        <Stack gap="8">
          <TextInput
            type="date"
            label={t('settings.plannedDate')}
            description={t('settings.dateHelp')}
            min={getLocalDate(new Date())}
            value={settings.date()}
            disabled={settings.pending()}
            error={
              validation.triggered && validation.error !== undefined
                ? t('validation.plannedDate')
                : undefined
            }
            onChange={wrap((event) => settings.date.change(event.currentTarget.value))}
            rightSection={
              <IconButton
                aria-label={t('common.clear')}
                appearance="ghost"
                disabled={settings.pending()}
                onPointerDown={(event) => event.preventDefault()}
                onClick={wrap(() => {
                  void settings.clearDate()
                })}
              >
                <X aria-hidden="true" />
              </IconButton>
            }
            onKeyDown={wrap((event) => {
              if (event.key === 'Enter') {
                void settings.saveDate()
              }
            })}
            onBlur={wrap(() => {
              void settings.saveDate()
            })}
          />
        </Stack>
        <Stack gap="8">
          <p className={styles.label}>{t('settings.appearance')}</p>
          <p className={styles.helper}>{t('settings.appearanceHelp')}</p>
          <SegmentedChoice
            aria-label={t('settings.appearance')}
            value={preferences?.appearance ?? 'light'}
            disabled={settings.pending()}
            data={[
              { value: 'light', label: t('settings.light') },
              { value: 'dark', label: t('settings.dark') },
            ]}
            onChange={wrap(settings.setAppearance)}
          />
        </Stack>
      </Grid>
      <output>{settings.pending() ? t('common.saving') : null}</output>
      {settings.error() !== null ? (
        <InlineNotice intent="danger">
          {t(settings.error() === 'conflict' ? 'errors.storageConflict' : 'errors.storage')}
        </InlineNotice>
      ) : null}
    </Panel>
  )
}, 'PreferencesSection')
