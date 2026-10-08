import { StatusBadge } from '@einbuergerungstest/design-system'
import { reatomComponent } from '@reatom/react'
import { Clock } from 'lucide-react'
import { memo } from 'react'

import type { MockPageModel } from '../../../../mock-test.model'
import { styles } from '../../mock-test-page.styles'

export const MockTimer = memo(
  reatomComponent(({ mock, localization }: Pick<MockPageModel, 'mock' | 'localization'>) => {
    const seconds = mock.remaining()

    const timer = `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

    return (
      <StatusBadge
        intent={seconds <= 300 ? 'warning' : 'neutral'}
        leftSection={<Clock size={16} aria-hidden="true" />}
      >
        <span
          role="timer"
          aria-label={localization.t()('mock.timeRemaining')}
          className={styles.timer}
        >
          {timer}
        </span>
      </StatusBadge>
    )
  }, 'MockTimer'),
)
