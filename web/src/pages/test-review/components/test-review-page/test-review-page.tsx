import { Grid, Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { TestReviewData } from '../../test-review.route'
import { ReviewPicker } from './components/review-picker/review-picker'
import { ReviewQuestion } from './components/review-question/review-question'
import { ReviewSummary } from './components/review-summary/review-summary'
import { styles } from './test-review-page.styles'

export const TestReviewPage = reatomComponent(({ data }: PageProps<TestReviewData>) => {
  const { model } = data
  const { sitting } = model()
  const t = model.localization.t()

  return (
    <Stack gap="16" css={styles.root}>
      <Toolbar placeContent="normal space-between">
        <h1 className={styles.eyebrow}>
          {t('navigation.mockTest')} /{' '}
          {t(sitting.status === 'completed' ? 'mock.completed' : 'mock.unfinished')}
        </h1>
        <span className={styles.muted}>
          {model.localization.formatDate(new Date(sitting.startedAt))}
        </span>
      </Toolbar>
      <Grid css={styles.columns}>
        <Stack css={styles.summary}>
          <ReviewSummary model={model} />
        </Stack>
        <Stack css={styles.question}>
          <ReviewQuestion model={model} />
        </Stack>
      </Grid>
      <ReviewPicker model={model} />
    </Stack>
  )
}, 'TestReviewPage')
