import { ButtonLink, Panel, StatusBadge } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { TestReviewModel } from '../../../../test-review.model'
import { styles } from '../../test-review-page.styles'

type ReviewSummaryProps = Readonly<{ model: TestReviewModel }>

export const ReviewSummary = reatomComponent(({ model }: ReviewSummaryProps) => {
  const { summary, finishReason } = model()
  const t = model.localization.t()

  return (
    <Panel>
      <Stack gap="16">
        {summary.status === 'completed' ? (
          <>
            <Wrap gap="8" alignItems="center">
              <h2 className={styles.score}>
                {summary.score} / {summary.total}
              </h2>
              <StatusBadge intent={summary.result === 'passed' ? 'success' : 'danger'}>
                {t(summary.result === 'passed' ? 'mock.passed' : 'mock.failed')}
              </StatusBadge>
            </Wrap>
            <p className={styles.muted}>{t('mock.threshold')}</p>
            <p className={styles.muted}>
              {t('mock.blankResult', { count: summary.total - summary.answered })}
            </p>
            <p>{t(finishReason === 'timeout' ? 'mock.timeout' : 'mock.submitted')}</p>
          </>
        ) : (
          <>
            <h2 className={styles.heading}>{t('mock.unfinished')}</h2>
            <StatusBadge>{t('mock.noScore')}</StatusBadge>
            <p>{t('mock.unfinishedHelp', { count: summary.answered })}</p>
          </>
        )}
        <ButtonLink href="/mock-test" appearance="outline">
          {t('mock.startAnother')}
        </ButtonLink>
      </Stack>
    </Panel>
  )
}, 'ReviewSummary')
