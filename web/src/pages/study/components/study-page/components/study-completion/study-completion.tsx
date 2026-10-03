import { Button, ButtonLink, Panel } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { StudySessionProps } from '../study-session/study-session'
import { styles } from '../../study-page.styles'
import { styles as completionStyles } from './study-completion.styles'

export const StudyCompletion = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()
  const total = model.totals()

  return (
    <Stack gap="24">
      {model.isGroup ? (
        <h2 className={completionStyles.title}>{t('study.groupCompleted')}</h2>
      ) : null}
      <Panel>
        <Stack gap="16">
          {model.isGroup ? (
            <>
              <h3 className={styles.heading}>{model.scope()}</h3>
              <p className={completionStyles.reached}>
                {t('study.groupReached', { count: total.total })}
              </p>
            </>
          ) : (
            <>
              <p className={styles.label}>{model.scope()}</p>
              <h2 className={styles.heading}>{t('study.completed')}</h2>
            </>
          )}
          <p>{model.completion()}</p>
          <p>
            {t('dashboard.contributing', { count: total.contributing, total: total.total })} ·{' '}
            {total.percentage}%
          </p>
          <Wrap gap="12" flexDirection={model.isGroup ? 'column' : 'row'}>
            <Button
              onClick={wrap(() => {
                void model.restart()
              })}
              disabled={model.flow.pending()}
            >
              {t(model.isGroup ? 'study.reviewGroup' : 'study.restart')}
            </Button>
            {model.isGroup ? (
              <ButtonLink appearance="outline" href={model.exitPath}>
                {t('study.backToGroups')}
              </ButtonLink>
            ) : (
              <>
                <a className={styles.link} href="/progress">
                  {t('navigation.progress')}
                </a>
                <a className={styles.link} href={model.exitPath}>
                  {t('navigation.home')}
                </a>
              </>
            )}
          </Wrap>
        </Stack>
      </Panel>
    </Stack>
  )
}, 'StudyCompletion')
