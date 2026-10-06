import { ButtonLink, Panel, StatusBadge } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { Check } from 'lucide-react'

import type { TestReviewModel } from '../../../../test-review.model'
import { getAppPath } from '../../../../../../app/offline/app-mode'
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
              <StatusBadge
                intent={summary.result === 'passed' ? 'success' : 'danger'}
                leftSection={
                  summary.result === 'passed' ? <Check size={16} aria-hidden="true" /> : null
                }
              >
                {t(summary.result === 'passed' ? 'mock.testPassed' : 'mock.failed')}
              </StatusBadge>
            </Wrap>
            <p className={styles.muted}>{t('mock.threshold')}</p>
            {summary.answered < summary.total ? (
              <p className={styles.muted}>
                {t('mock.blankResult', { count: summary.total - summary.answered })}
              </p>
            ) : null}
            <p>{t(finishReason === 'timeout' ? 'mock.timeout' : 'mock.submitted')}</p>
            {summary.result === 'passed' ? (
              <p>{t('mock.wellDone')}</p>
            ) : (
              <>
                <p className={styles.reviewHelpBelow}>{t('mock.reviewHelpBelow')}</p>
                <p className={styles.reviewHelpBeside}>{t('mock.reviewHelp')}</p>
              </>
            )}
          </>
        ) : (
          <>
            <h2 className={styles.heading}>{t('mock.unfinished')}</h2>
            <StatusBadge>{t('mock.noScore')}</StatusBadge>
            <p>{t('mock.unfinishedHelp', { count: summary.answered })}</p>
          </>
        )}
        <ButtonLink href={getAppPath('/mock-test')} appearance="outline">
          {t('mock.startAnother')}
        </ButtonLink>
      </Stack>
    </Panel>
  )
}, 'ReviewSummary')
