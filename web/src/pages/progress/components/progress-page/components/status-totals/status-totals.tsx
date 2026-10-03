import { Panel } from '@einbuergerungstest/design-system'
import { Grid } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { ProgressPageModel } from '../../../../progress.model'
import { QuestionStatusBadge } from '../../../../../../modules/learner-state'
import { styles } from '../../progress-page.styles'

type StatusTotalsProps = Readonly<{ model: ProgressPageModel }>

const statuses = ['not-started', 'needs-review', 'learning', 'learned'] as const

export const StatusTotals = reatomComponent(
  ({ model }: StatusTotalsProps) => (
    <Grid css={styles.totals}>
      {statuses.map((status) => (
        <Panel key={status} className={styles.panel}>
          <p className={styles.count}>
            {model.localization.formatNumber(model.totals().statuses[status])}
          </p>
          <QuestionStatusBadge status={status} t={model.localization.t()} />
        </Panel>
      ))}
    </Grid>
  ),
  'StatusTotals',
)
