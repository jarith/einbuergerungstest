import { Tabs } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { ProgressData } from '../../progress.model'
import { MockHistory } from './components/mock-history/mock-history'
import { QuestionOverview } from './components/question-overview/question-overview'
import { styles } from './progress-page.styles'

export const ProgressPage = reatomComponent(
  ({ data }: PageProps<ProgressData>) => (
    <Stack gap="24" css={styles.root}>
      <Tabs value={data.tab} onChange={wrap(data.selectTab)}>
        <Tabs.List aria-label={data.localization.t()('navigation.progress')}>
          <Tabs.Tab value="question-status">{data.localization.t()('study.status')}</Tabs.Tab>
          <Tabs.Tab value="mock-tests">{data.localization.t()('progress.mockTitle')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="question-status">
          <QuestionOverview model={data.model} />
        </Tabs.Panel>
        <Tabs.Panel value="mock-tests">
          <MockHistory model={data.model} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  ),
  'ProgressPage',
)
