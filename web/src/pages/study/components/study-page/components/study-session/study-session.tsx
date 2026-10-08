import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { StudyModel } from '../../../../study.model'
import { styles } from '../../study-page.styles'
import { StudyCompletion } from '../study-completion/study-completion'
import { StudyHeader } from '../study-header/study-header'
import { StudyHelp } from '../study-help/study-help'
import { StudyQuestionSession } from '../study-question-session/study-question-session'
import { StudySaveStatus } from '../study-save-status/study-save-status'

export type StudySessionProps = Readonly<{ model: StudyModel }>

export const StudySession = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()

  return (
    <Stack gap="layout.section" css={{ ...styles.root }}>
      {model.isCompleted() ? (
        <StudyCompletion model={model} />
      ) : (
        <>
          <StudyHeader model={model} />
          <Stack gap="24" minWidth="0">
            <StudyQuestionSession model={model} />
            {model.isGroup ? (
              <a className={styles.link} href={model.exitPath}>
                ← {t('study.backToDashboard')}
              </a>
            ) : null}
            <StudyHelp localization={model.localization} />
          </Stack>
        </>
      )}
      <StudySaveStatus model={model} />
    </Stack>
  )
}, 'StudySession')
