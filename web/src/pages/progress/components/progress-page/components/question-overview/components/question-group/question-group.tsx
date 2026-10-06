import { Accordion, Button, Panel } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { ProgressGroup, ProgressPageModel } from '../../../../../../progress.model'
import { QuestionStatusBar } from '../../../../../../../../modules/learner-state'
import { styles } from '../../../../progress-page.styles'
import { QuestionRow } from '../question-row/question-row'

type QuestionGroupProps = Readonly<{ group: ProgressGroup; model: ProgressPageModel }>

export const QuestionGroup = reatomComponent(({ group, model }: QuestionGroupProps) => {
  const t = model.localization.t()

  return (
    <Accordion.Item value={group.id}>
      <Accordion.Control>
        <Stack as="span" gap="8">
          <span className={styles.groupTitle}>{group.title}</span>
          <span className={styles.muted}>
            {model.filter() === 'all'
              ? t('progress.groupCounts', {
                  count: group.total,
                  learned: group.statuses.learned,
                  contributing: group.contributing,
                })
              : t('progress.groupMatches', { count: group.matches, total: group.total })}
          </span>
          <QuestionStatusBar group={group} t={t} focusable={false} />
        </Stack>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="12">
          <output className={styles.muted}>
            {t('questions.showing', { count: group.rows.length, total: group.matches })}
          </output>
          <Panel className={styles.panel}>
            {group.rows.length === 0 ? (
              <p className={styles.muted}>{t('progress.noGroupMatches')}</p>
            ) : (
              <Stack as="ol" css={styles.list}>
                {group.rows.map((row) => (
                  <QuestionRow key={row.key} row={row} t={t} />
                ))}
              </Stack>
            )}
          </Panel>
          {group.remaining > 0 ? (
            <Button appearance="outline" fullWidth onClick={wrap(() => model.showMore(group.id))}>
              {t('questions.showMore', { count: Math.min(model.pageSize, group.remaining) })}
            </Button>
          ) : null}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  )
}, 'QuestionGroup')
