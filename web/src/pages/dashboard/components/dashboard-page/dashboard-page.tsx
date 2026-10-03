import { Divider } from '@einbuergerungstest/design-system'
import { Grid, Stack } from '@einbuergerungstest/design-system/jsx'

import type { PageProps } from '../../../../app/routing'
import type { DashboardData, DashboardModel } from '../../dashboard.model'
import { DashboardIntro } from './components/dashboard-intro/dashboard-intro'
import { ExamFormat } from './components/exam-format/exam-format'
import { GroupProgress } from './components/group-progress/group-progress'
import { ProgressSummary } from './components/progress-summary/progress-summary'
import { TestCountdown } from './components/test-countdown/test-countdown'
import { styles } from './dashboard-page.styles'

export type DashboardSectionProps = Readonly<{ model: DashboardModel }>

export const DashboardPage = ({ data }: PageProps<DashboardData>) => (
  <Stack gap="layout.section" css={{ ...styles.root }}>
    <Grid css={{ ...styles.introGrid }}>
      <DashboardIntro model={data.dashboard} />
      <TestCountdown model={data.dashboard} />
      <ExamFormat model={data.dashboard} />
    </Grid>
    <Divider />
    <ProgressSummary model={data.dashboard} />
    <GroupProgress model={data.dashboard} />
  </Stack>
)
