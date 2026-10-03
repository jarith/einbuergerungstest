import { Panel, StatusBadge } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { Check, X } from 'lucide-react'

import type { QuestionHistoryModel } from '../../../../question-history.model'
import { styles } from './latest-attempt.styles'

type LatestAttemptProps = Readonly<{ model: QuestionHistoryModel }>

export const LatestAttempt = reatomComponent(({ model }: LatestAttemptProps) => {
  const { progress, correctOption } = model()
  const attempt = progress.lastAttempt
  const t = model.localization.t()

  return (
    <Panel>
      <Stack gap="16">
        {attempt === null ? (
          <>
            <h3 className={styles.heading}>{t('progress.notStarted')}</h3>
            <p>{t('history.noAttempts')}</p>
          </>
        ) : (
          <>
            <Wrap gap="8" alignItems="center">
              <h3 className={styles.heading}>{t('history.latest')}</h3>
              <StatusBadge
                intent={attempt.isCorrect ? 'success' : 'danger'}
                leftSection={
                  attempt.isCorrect ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <X size={16} aria-hidden="true" />
                  )
                }
              >
                {t(attempt.isCorrect ? 'study.correct' : 'study.mistaken')}
              </StatusBadge>
            </Wrap>
            <p className={styles.date}>
              <time dateTime={new Date(attempt.answeredAt).toISOString()}>
                {model.localization.formatDate(new Date(attempt.answeredAt), {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </time>{' '}
              · {t(attempt.source === 'study' ? 'history.sourceStudy' : 'history.sourceMock')}
            </p>
            <p className={styles.answer}>
              {t('mock.yourChoice')}{' '}
              <span lang="de">
                {attempt.selectedOption} · {model.getOption(attempt.selectedOption)?.text_de}
              </span>
            </p>
          </>
        )}
        <p className={styles.answer}>
          {t('study.correctAnswer', { answer: correctOption.label })} —{' '}
          <span lang="de">{correctOption.text_de}</span>
        </p>
      </Stack>
    </Panel>
  )
}, 'LatestAttempt')
