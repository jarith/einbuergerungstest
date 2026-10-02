import { Panel } from '@einbuergerungstest/design-system'
import { Flex, Grid } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { styles } from '../../dashboard-page.styles'

export const ExamFormat = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()

  const facts = [
    { value: 33, label: t('dashboard.questions') },
    { value: 60, label: t('dashboard.minutes') },
    { value: 17, label: t('dashboard.toPass') },
  ]

  return (
    <Panel className={styles.exam}>
      <h2 className={styles.heading}>{t('dashboard.mockTitle')}</h2>
      <p className={styles.examDescription}>{t('dashboard.mockDescription')}</p>
      <Grid css={{ ...styles.facts }}>
        {facts.map((fact) => (
          <Flex key={fact.value} css={{ ...styles.fact }}>
            <strong className={styles.factValue}>{fact.value}</strong>
            <span>{fact.label}</span>
          </Flex>
        ))}
      </Grid>
    </Panel>
  )
}, 'ExamFormat')
