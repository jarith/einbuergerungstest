import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { ProgressData } from '../../progress.model'
import { MockHistory } from './components/mock-history/mock-history'
import { QuestionOverview } from './components/question-overview/question-overview'
import { styles } from './progress-page.styles'

export const ProgressPage = reatomComponent(
  ({ data }: PageProps<ProgressData>) => (
    <Stack gap="24" css={styles.root}>
      <Grid css={styles.columns}>
        <QuestionOverview model={data.model} />
        <MockHistory model={data.model} />
      </Grid>
    </Stack>
  ),
  'ProgressPage',
)
