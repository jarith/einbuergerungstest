import { Button, Panel } from '@einbuergerungstest/design-system'
import { Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ArrowRight } from 'lucide-react'

import type { ProgressPageModel } from '../../../../progress.model'
import { QuestionStatusFilter } from '../../../../../../modules/learner-state'
import { styles } from '../../progress-page.styles'
import { QuestionRow } from './components/question-row/question-row'

type QuestionOverviewProps = Readonly<{ model: ProgressPageModel }>

export const QuestionOverview = reatomComponent(({ model }: QuestionOverviewProps) => {
  const t = model.localization.t()
  const rows = model()

  return (
    <Stack as="section" gap="16" minWidth="0" aria-labelledby="question-status-title">
      <h2 id="question-status-title" className={styles.heading}>
        {t('study.status')}
      </h2>
      <QuestionStatusFilter
        value={model.filter()}
        totals={model.totals()}
        onChange={wrap(model.setFilter)}
        t={t}
      />
      <output className={styles.muted}>
        {t('questions.showing', { count: rows.length, total: model.total() })}
      </output>
      <Panel className={styles.panel}>
        {rows.length === 0 ? (
          <p>{t('questions.empty')}</p>
        ) : (
          <Stack as="ol" css={styles.list}>
            {rows.map((row) => (
              <QuestionRow key={row.key} row={row} t={t} />
            ))}
          </Stack>
        )}
      </Panel>
      {model.remaining() > 0 ? (
        <Toolbar placeContent="normal end">
          <Button
            appearance="ghost"
            rightSection={<ArrowRight size={16} aria-hidden="true" />}
            onClick={wrap(model.showMore)}
          >
            {t('questions.showMore', { count: Math.min(model.pageSize, model.remaining()) })}
          </Button>
        </Toolbar>
      ) : null}
    </Stack>
  )
}, 'QuestionOverview')
