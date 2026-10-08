import { Grid, Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'

import type { MockPageModel } from '../../../../mock-test.model'
import { styles } from '../../mock-test-page.styles'
import { MockDialogs } from '../mock-dialogs/mock-dialogs'
import { MockPosition } from '../mock-position/mock-position'
import { MockQuestion } from '../mock-question/mock-question'
import { MockSummary } from '../mock-summary/mock-summary'
import { MockTimer } from '../mock-timer/mock-timer'

type MockSessionProps = Readonly<{ model: MockPageModel }>

export const MockSession = ({ model }: MockSessionProps) => {
  return (
    <Stack gap="16">
      <Toolbar placeContent="normal space-between">
        <MockPosition model={model} />
        <MockTimer mock={model.mock} localization={model.localization} />
      </Toolbar>
      <Grid css={styles.columns}>
        <Stack gap="16" minWidth="0">
          <MockQuestion model={model} />
        </Stack>
        <MockSummary mock={model.mock} localization={model.localization} picker={model.picker} />
      </Grid>
      <MockDialogs model={model} />
    </Stack>
  )
}
