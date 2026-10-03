import { Button, InlineNotice, Panel } from '@einbuergerungstest/design-system'
import { Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ArrowRight } from 'lucide-react'

import type { PageProps } from '../../../../app/routing'
import type { QuestionListData } from '../../question-list.model'
import { QuestionFilters } from './components/question-filters/question-filters'
import { QuestionRow } from './components/question-row/question-row'
import { styles } from './question-list-page.styles'

export const QuestionListPage = reatomComponent(({ data }: PageProps<QuestionListData>) => {
  const { model } = data
  const t = model.localization.t()
  const rows = model()

  return (
    <Stack gap="16" css={styles.root}>
      <QuestionFilters model={model} />
      <output className={styles.muted}>
        {t('questions.showing', { count: rows.length, total: model.total() })}
      </output>
      {rows.length === 0 ? (
        <InlineNotice>{t('questions.empty')}</InlineNotice>
      ) : (
        <Panel className={styles.panel}>
          <Stack as="ol" css={styles.rows}>
            {rows.map((row) => (
              <QuestionRow key={row.key} row={row} t={t} />
            ))}
          </Stack>
        </Panel>
      )}
      {model.remaining() > 0 ? (
        <Toolbar placeContent="normal end">
          <Button
            appearance="ghost"
            rightSection={<ArrowRight size={16} aria-hidden="true" />}
            onClick={wrap(model.showMore)}
          >
            {t('questions.showMore', { count: Math.min(8, model.remaining()) })}
          </Button>
        </Toolbar>
      ) : null}
    </Stack>
  )
}, 'QuestionListPage')
