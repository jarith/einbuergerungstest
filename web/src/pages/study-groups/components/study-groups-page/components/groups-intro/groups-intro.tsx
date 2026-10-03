import { Panel } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { ArrowRight, BookOpen } from 'lucide-react'

import type { StudyGroupsSectionProps } from '../../study-groups-page'
import { styles as pageStyles } from '../../study-groups-page.styles'
import { styles } from './groups-intro.styles'

export const GroupsIntro = reatomComponent(({ model }: StudyGroupsSectionProps) => {
  const t = model.localization.t()

  return (
    <Stack gap="24">
      <Stack as="header" gap="8">
        <p className={styles.eyebrow}>{t('groups.eyebrow')}</p>
        <h2 className={styles.title}>{t('groups.title')}</h2>
        <p className={styles.description}>{t('groups.description')}</p>
      </Stack>
      <a className={pageStyles.link} href="/study">
        <BookOpen aria-hidden="true" />
        <span>{t('groups.studyAll', { count: model.questionCount })}</span>
        <ArrowRight aria-hidden="true" />
      </a>
      <Panel tone="muted" edge="plain">
        <Stack gap="4">
          <p className={styles.summary}>
            {t('groups.summary', { count: model().length, questions: model.questionCount })}
          </p>
          <p className={styles.description}>{t('groups.progressHelp')}</p>
        </Stack>
      </Panel>
    </Stack>
  )
}, 'GroupsIntro')
