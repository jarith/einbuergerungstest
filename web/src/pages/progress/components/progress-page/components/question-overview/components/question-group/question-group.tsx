import { Accordion, Button } from '@einbuergerungstest/design-system'
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
    <Accordion.Group
      value={group.id}
      title={group.title}
      details={
        <>
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
        </>
      }
    >
      <Stack gap="12">
        <output className={styles.muted}>
          {t('questions.showing', { count: group.rows.length, total: group.matches })}
        </output>
        {group.rows.length === 0 ? (
          <p className={styles.muted}>{t('progress.noGroupMatches')}</p>
        ) : (
          <Stack as="ol" css={styles.list}>
            {group.rows.map((row) => (
              <QuestionRow key={row.key} row={row} t={t} />
            ))}
          </Stack>
        )}
        {group.remaining > 0 ? (
          <Button appearance="outline" fullWidth onClick={wrap(() => model.showMore(group.id))}>
            {t('questions.showMore', { count: Math.min(model.pageSize, group.remaining) })}
          </Button>
        ) : null}
      </Stack>
    </Accordion.Group>
  )
}, 'QuestionGroup')
