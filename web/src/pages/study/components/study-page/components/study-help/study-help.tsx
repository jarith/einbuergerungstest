import { Panel } from '@einbuergerungstest/design-system'
import { reatomComponent } from '@reatom/react'

import type { StudySessionProps } from '../study-session/study-session'
import { QuestionStatusBadge } from '../../../../../../modules/learner-state'
import { styles } from '../../study-page.styles'

export const StudyHelp = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()

  return (
    <aside className={styles.help}>
      <Panel>
        <h2 className={styles.heading}>{t('study.helpTitle')}</h2>
        <p>{t('study.helpBody')}</p>
        <p className={styles.label}>{t('study.status')}</p>
        <QuestionStatusBadge status={model.status()} t={t} />
        <p>{t('study.progressHelp')}</p>
        <a className={styles.link} href="/progress">
          {t('navigation.progress')} →
        </a>
      </Panel>
    </aside>
  )
}, 'StudyHelp')
