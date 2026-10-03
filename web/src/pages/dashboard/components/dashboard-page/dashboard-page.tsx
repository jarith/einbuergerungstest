import { Divider } from '@einbuergerungstest/design-system'
import { Grid } from '@einbuergerungstest/design-system/jsx'

import type { PageProps } from '../../../../app/routing'
import type { DashboardData, DashboardModel } from '../../dashboard.model'
import { DashboardIntro } from './components/dashboard-intro/dashboard-intro'
import { GroupProgress } from './components/group-progress/group-progress'
import { ProgressSummary } from './components/progress-summary/progress-summary'
import { SavedProgress } from './components/saved-progress/saved-progress'
import { TestCountdown } from './components/test-countdown/test-countdown'
import { styles } from './dashboard-page.styles'

export type DashboardSectionProps = Readonly<{ model: DashboardModel }>

export const DashboardPage = ({ data }: PageProps<DashboardData>) => (
  <Grid css={{ ...styles.root }}>
    <Grid css={{ ...styles.introGrid }}>
      <DashboardIntro model={data.dashboard} />
      <TestCountdown model={data.dashboard} />
    </Grid>
    <Divider className={styles.divider} />
    <ProgressSummary model={data.dashboard} />
    <GroupProgress model={data.dashboard} />
    <SavedProgress model={data.dashboard} />
  </Grid>
)
