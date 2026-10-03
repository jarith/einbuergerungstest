import { Button } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { MockPageModel } from '../../../../mock-test.model'
import { ExamFormat } from './components/exam-format/exam-format'
import { styles } from './mock-intro.styles'

type MockIntroProps = Readonly<{ model: MockPageModel }>

export const MockIntro = reatomComponent(({ model }: MockIntroProps) => {
  const t = model.localization.t()

  return (
    <Stack gap="24" alignItems="start" css={{ ...styles.root }}>
      <h1 className={styles.title}>{t('mock.start')}</h1>
      <p>{t('mock.introduction')}</p>
      <ExamFormat model={model} />
      <p>{t('mock.rules')}</p>
      <Button
        disabled={model.mock.pending()}
        onClick={wrap(() => {
          void model.start()
        })}
      >
        {t('mock.start')}
      </Button>
    </Stack>
  )
}, 'MockIntro')
