import { InlineNotice } from '@einbuergerungstest/design-system'
import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { StudyModel } from '../../../../study.model'
import { PendingNotice } from '../../../../../../app/components/pending-notice/pending-notice'
import {
  isLearnerStateConflict,
  QuestionStatusBadge,
} from '../../../../../../modules/learner-state'
import { QuestionContent } from '../../../../../../modules/question-bank'
import { styles } from '../../study-page.styles'
import { StudyCompletion } from '../study-completion/study-completion'
import { StudyControls } from '../study-controls/study-controls'
import { StudyHelp } from '../study-help/study-help'

export type StudySessionProps = Readonly<{ model: StudyModel }>

export const StudySession = reatomComponent(({ model }: StudySessionProps) => {
  const current = model()
  const t = model.localization.t()
  const error = model.flow.error()

  return (
    <Stack gap="layout.section" css={{ ...styles.root }}>
      {current.isCompleted ? (
        <StudyCompletion model={model} />
      ) : (
        <>
          <Flex justify="space-between" gap="16" css={{ ...styles.scope }}>
            <span className={styles.scopeLabel}>
              {t(model.isGroup ? 'navigation.groups' : 'navigation.study')} / {model.scope()}
            </span>
            <span
              className={styles.position}
              aria-label={t('common.questionPosition', {
                current: current.index + 1,
                total: current.total,
              })}
            >
              {current.index + 1}/{current.total}
            </span>
          </Flex>
          <Stack gap="24" minWidth="0">
            <QuestionStatusBadge status={model.status()} t={t} />
            <QuestionContent
              key={current.key}
              loaded={current.loaded}
              selectedOption={current.selectedOption}
              interaction={{
                mode: 'study',
                hasJustLearned: current.hasJustLearned,
                shouldAnnounceFeedback: model.flow.shouldAnnounceFeedback,
                isPending: model.flow.pending(),
                onSelect: wrap((option) => {
                  void model.flow.answer(option)
                }),
              }}
              language={model.localization.language()}
              translationEnabled={model.translation().enabled}
              onTranslationChange={wrap((enabled) => {
                void model.flow.setTranslation(enabled)
              })}
              t={t}
            />
            <StudyControls model={model} />
            {model.isGroup ? (
              <a className={styles.link} href={model.exitPath}>
                ← {t('study.backToDashboard')}
              </a>
            ) : null}
            <StudyHelp model={model} />
          </Stack>
        </>
      )}
      <output>
        {model.flow.pending() ? (
          <PendingNotice message={t('common.saving')} longWaitMessage={t('common.savingSlow')} />
        ) : null}
      </output>
      {error !== null ? (
        <InlineNotice intent="danger" role="alert">
          {t(isLearnerStateConflict(error) ? 'errors.storageConflict' : 'errors.storage')}
        </InlineNotice>
      ) : null}
    </Stack>
  )
}, 'StudySession')
