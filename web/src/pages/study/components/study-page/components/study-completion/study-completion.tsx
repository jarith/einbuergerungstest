import { Button, Panel } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { StudySessionProps } from '../study-session/study-session'
import { styles } from '../../study-page.styles'

export const StudyCompletion = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()
  const total = model.totals()

  return (
    <Panel>
      <Stack gap="16">
        <p className={styles.label}>{model.scope()}</p>
        <h2 className={styles.heading}>{t('study.completed')}</h2>
        <p>{model.completion()}</p>
        <p>
          {t('dashboard.contributing', { count: total.contributing, total: total.total })} ·{' '}
          {total.percentage}%
        </p>
        <Wrap gap="12">
          <Button
            onClick={wrap(() => {
              void model.restart()
            })}
            disabled={model.flow.pending()}
          >
            {t('study.restart')}
          </Button>
          <a className={styles.link} href="/progress">
            {t('navigation.progress')}
          </a>
          <a className={styles.link} href={model.exitPath}>
            {t('navigation.home')}
          </a>
        </Wrap>
      </Stack>
    </Panel>
  )
}, 'StudyCompletion')
