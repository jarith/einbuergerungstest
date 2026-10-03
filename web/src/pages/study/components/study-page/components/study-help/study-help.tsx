import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { ChevronDown } from 'lucide-react'

import type { StudySessionProps } from '../study-session/study-session'
import { styles as pageStyles } from '../../study-page.styles'
import { styles } from './study-help.styles'

export const StudyHelp = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()

  return (
    <details className={styles.root}>
      <summary className={styles.trigger}>
        {t('study.helpTitle')}
        <ChevronDown aria-hidden="true" className={styles.icon} />
      </summary>
      <Stack gap="12" paddingBlock="8">
        <p>{t('study.helpBody')}</p>
        <a className={pageStyles.link} href="/progress">
          {t('navigation.progress')} →
        </a>
      </Stack>
    </details>
  )
}, 'StudyHelp')
