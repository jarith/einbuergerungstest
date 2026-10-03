import { StatusBadge } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { Check, X } from 'lucide-react'

import type { QuestionHistoryModel } from '../../../../question-history.model'
import { styles } from '../../question-history-page.styles'

type EarlierAttemptsProps = Readonly<{ model: QuestionHistoryModel }>

export const EarlierAttempts = reatomComponent(({ model }: EarlierAttemptsProps) => {
  const { earlier } = model()
  const t = model.localization.t()

  return (
    <Stack gap="16">
      <h3 className={styles.heading}>{t('history.earlier')}</h3>
      {earlier.length === 0 ? (
        <p className={styles.muted}>{t('history.noEarlier')}</p>
      ) : (
        <Stack as="ol" css={styles.history}>
          {earlier.map((attempt) => (
            <Stack as="li" key={attempt.id} css={styles.entry}>
              <Wrap gap="8" alignItems="center">
                <time
                  className={styles.muted}
                  dateTime={new Date(attempt.answeredAt).toISOString()}
                >
                  {model.localization.formatDate(new Date(attempt.answeredAt), {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
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
              <p className={styles.muted}>
                {t(attempt.source === 'study' ? 'history.sourceStudy' : 'history.sourceMock')}
              </p>
              <p lang="de">
                {attempt.selectedOption} · {model.getOption(attempt.selectedOption)?.text_de}
              </p>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}, 'EarlierAttempts')
