import type { TFunction } from 'i18next'
import { IconButton, Tooltip } from '@einbuergerungstest/design-system'
import { Check, Languages } from 'lucide-react'

import { styles } from './translation-button.styles'

type TranslationButtonProps = Readonly<{
  isEnabled: boolean
  isPending: boolean
  onChange: (enabled: boolean) => void
  t: TFunction
}>

export const TranslationButton = ({
  isEnabled,
  isPending,
  onChange,
  t,
}: TranslationButtonProps) => (
  <Tooltip label={t(isEnabled ? 'settings.hideStudyTranslation' : 'settings.studyTranslation')}>
    <IconButton
      className={styles.button}
      appearance={isEnabled ? 'solid' : 'outline'}
      aria-label={t('settings.studyTranslation')}
      aria-pressed={isEnabled}
      aria-disabled={isPending}
      data-disabled={isPending}
      onClick={() => {
        if (!isPending) {
          onChange(!isEnabled)
        }
      }}
    >
      <Languages className={styles.icon} aria-hidden="true" />
      {isEnabled ? <Check className={styles.indicator} aria-hidden="true" /> : null}
    </IconButton>
  </Tooltip>
)
