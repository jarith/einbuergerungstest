import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { CalendarDays } from 'lucide-react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { getAppPath } from '../../../../../../app/offline/app-mode'
import { styles } from '../../dashboard-page.styles'

export const TestCountdown = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()
  const date = model.date()

  return (
    <Flex css={{ ...styles.countdown }}>
      <CalendarDays aria-hidden="true" className={styles.icon} />
      <Stack gap="4" css={{ ...styles.countdownCopy }}>
        <strong className={styles.countdownTitle}>
          {date === null
            ? t('dashboard.noDate')
            : date.days === 0
              ? t('dashboard.testToday')
              : t('dashboard.daysUntilTest', { count: date.days })}
        </strong>
        <p className={styles.caption}>
          {date === null
            ? t('dashboard.dateHelp')
            : t('dashboard.plannedFor', { date: date.label })}
        </p>
      </Stack>
      <a className={styles.link} href={getAppPath('/settings')}>
        {t(date === null ? 'dashboard.setDate' : 'dashboard.editDate')} →
      </a>
    </Flex>
  )
}, 'TestCountdown')
