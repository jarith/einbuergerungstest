import { Button, Panel } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { ProgressPageModel } from '../../../../progress.model'
import { QuestionStatusBadge } from '../../../../../../modules/learner-state'
import { styles } from '../../progress-page.styles'

type QuestionOverviewProps = Readonly<{ model: ProgressPageModel }>

const filters = [
  { value: 'all', label: 'questions.all' },
  { value: 'not-started', label: 'progress.notStarted' },
  { value: 'needs-review', label: 'progress.needsReview' },
  { value: 'learning', label: 'progress.learning' },
  { value: 'learned', label: 'progress.learned' },
] as const

export const QuestionOverview = reatomComponent(({ model }: QuestionOverviewProps) => {
  const t = model.localization.t()
  const rows = model()

  return (
    <Stack as="section" gap="16" minWidth="0" aria-labelledby="question-status-title">
      <Wrap justifyContent="space-between" alignItems="center">
        <h2 id="question-status-title" className={styles.heading}>
          {t('study.status')}
        </h2>
        <span className={styles.muted}>
          {t('questions.total', { count: model.totals().total })}
        </span>
      </Wrap>
      <Wrap
        as="fieldset"
        gap="8"
        border="none"
        padding="0"
        minWidth="0"
        aria-label={t('questions.filter')}
      >
        {filters.map((filter) => (
          <Button
            key={filter.value}
            appearance={model.filter() === filter.value ? 'solid' : 'outline'}
            aria-pressed={model.filter() === filter.value}
            onClick={wrap(() => model.setFilter(filter.value))}
          >
            {t(filter.label)}
          </Button>
        ))}
      </Wrap>
      <Panel className={styles.panel}>
        {rows.length === 0 ? (
          <p>{t('questions.empty')}</p>
        ) : (
          <Stack as="ol" css={styles.list}>
            {rows.map((row) => (
              <li key={row.key}>
                <a href={row.href} className={styles.row}>
                  <Stack gap="8" minWidth="0" flex="[1 1 12rem]">
                    <span lang="de" className={styles.prompt}>
                      {row.question.number} · {row.question.question_de}
                    </span>
                    <span className={styles.muted}>
                      {row.history.attemptCount === 0
                        ? t('questions.noAttempts')
                        : t('common.attempt', { count: row.history.attemptCount })}
                    </span>
                  </Stack>
                  <QuestionStatusBadge status={row.history.status} t={t} />
                </a>
              </li>
            ))}
          </Stack>
        )}
      </Panel>
      <a href="/progress/questions" className={styles.link}>
        {t('progress.browse', { count: model.totals().total })} →
      </a>
    </Stack>
  )
}, 'QuestionOverview')
