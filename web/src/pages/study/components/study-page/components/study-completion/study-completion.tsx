import { Button, ButtonLink, ProgressBar } from '@einbuergerungstest/design-system'
import { Flex, Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Check } from 'lucide-react'

import type { StudySessionProps } from '../study-session/study-session'
import { getAppPath } from '../../../../../../app/offline/app-mode'
import { styles } from '../../study-page.styles'
import { styles as completionStyles } from './study-completion.styles'

export const StudyCompletion = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()
  const total = model.totals()

  return (
    <Stack gap="24" css={{ ...completionStyles.root }} data-animate={model.shouldAnimateCompletion}>
      {model.isGroup ? (
        <Flex gap="12" align="center">
          <Check aria-hidden="true" className={completionStyles.check} />
          <h2 className={completionStyles.title}>{t('study.groupCompleted')}</h2>
        </Flex>
      ) : null}
      <Stack gap="16">
        {model.isGroup ? (
          <>
            <h3 className={styles.heading}>{model.scope()}</h3>
            <p className={completionStyles.reached}>
              {t('study.groupReached', { count: total.total })}
            </p>
            <p>{t('study.effortAcknowledgment')}</p>
          </>
        ) : (
          <>
            <p className={styles.label}>{model.scope()}</p>
            <h2 className={styles.heading}>{t('study.completed')}</h2>
          </>
        )}
        <p>
          {t('dashboard.contributing', { count: total.contributing, total: total.total })} ·{' '}
          {total.percentage}%
        </p>
        {model.isGroup ? (
          <ProgressBar
            aria-label={model.scope()}
            aria-valuenow={total.contributing}
            aria-valuemax={total.total}
            aria-valuetext={t('dashboard.contributing', {
              count: total.contributing,
              total: total.total,
            })}
            value={(total.contributing / total.total) * 100}
          />
        ) : null}
        <p className={completionStyles.explanation}>{model.completion()}</p>
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
              {t('study.backToDashboard')}
            </ButtonLink>
          ) : (
            <>
              <a className={styles.link} href={getAppPath('/progress')}>
                {t('navigation.progress')}
              </a>
              <a className={styles.link} href={model.exitPath}>
                {t('navigation.home')}
              </a>
            </>
          )}
        </Wrap>
      </Stack>
    </Stack>
  )
}, 'StudyCompletion')
