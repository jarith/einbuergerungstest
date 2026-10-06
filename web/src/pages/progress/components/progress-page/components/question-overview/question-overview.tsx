import { Accordion, Button, Panel } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { ProgressPageModel } from '../../../../progress.model'
import { QuestionStatusFilter } from '../../../../../../modules/learner-state'
import { styles } from '../../progress-page.styles'
import { QuestionGroup } from './components/question-group/question-group'

type QuestionOverviewProps = Readonly<{ model: ProgressPageModel }>

export const QuestionOverview = reatomComponent(({ model }: QuestionOverviewProps) => {
  const t = model.localization.t()
  const groups = model.groups()

  return (
    <Stack as="section" gap="16" minWidth="0" aria-label={t('study.status')}>
      <p className={styles.filterLabel}>{t('progress.filterGroups')}</p>
      <QuestionStatusFilter
        value={model.filter()}
        totals={model.totals()}
        onChange={wrap(model.setFilter)}
        t={t}
      />
      <output className={styles.muted}>
        {t(model.filter() === 'all' ? 'progress.groupTotal' : 'progress.matchTotal', {
          count: model.total(),
          groups: model.filter() === 'all' ? groups.length : model.matchingGroups(),
        })}
      </output>
      {model.total() === 0 ? (
        <Panel className={styles.empty}>
          <p>{t(model.filter() === 'learned' ? 'progress.noLearned' : 'questions.empty')}</p>
          <Button appearance="outline" onClick={wrap(() => model.setFilter('all'))}>
            {t('progress.showAll')}
          </Button>
        </Panel>
      ) : null}
      <Accordion
        multiple
        keepMounted={false}
        value={model.expanded()}
        onChange={wrap((value) => model.expanded.set(value))}
        order={2}
      >
        {groups.map((group) => (
          <QuestionGroup key={group.id} group={group} model={model} />
        ))}
      </Accordion>
    </Stack>
  )
}, 'QuestionOverview')
