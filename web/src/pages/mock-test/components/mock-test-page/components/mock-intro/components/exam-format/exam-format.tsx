import { Flex, Grid } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { MockPageModel } from '../../../../../../mock-test.model'
import { styles } from './exam-format.styles'

type ExamFormatProps = Readonly<{ model: MockPageModel }>

export const ExamFormat = reatomComponent(({ model }: ExamFormatProps) => {
  const t = model.localization.t()

  const facts = [
    { value: 33, label: t('mock.questions') },
    { value: 60, label: t('mock.minutes') },
    { value: 17, label: t('mock.toPass') },
  ]

  return (
    <Grid as="section" aria-label={t('mock.formatTitle')} css={{ ...styles.facts }}>
      {facts.map((fact) => (
        <Flex key={fact.value} css={{ ...styles.fact }}>
          <strong className={styles.factValue}>{fact.value}</strong>
          <span>{fact.label}</span>
        </Flex>
      ))}
    </Grid>
  )
}, 'ExamFormat')
