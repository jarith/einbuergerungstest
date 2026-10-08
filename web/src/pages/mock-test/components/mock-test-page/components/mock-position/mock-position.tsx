import { reatomComponent } from '@reatom/react'

import type { MockPageModel } from '../../../../mock-test.model'
import { styles } from '../../mock-test-page.styles'

type MockPositionProps = Readonly<{ model: MockPageModel }>

export const MockPosition = reatomComponent(({ model }: MockPositionProps) => {
  const t = model.localization.t()

  return (
    <h1 className={styles.eyebrow}>
      {t('navigation.mockTest')} /{' '}
      {t('common.questionPosition', { current: model().index + 1, total: 33 })}
    </h1>
  )
}, 'MockPosition')
