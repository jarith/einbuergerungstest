import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { styles } from '../../dashboard-page.styles'

export const ProgressSummary = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()
  const total = model()

  return (
    <Stack css={{ ...styles.summary }}>
      <h2 className={styles.summaryHeading}>{t('dashboard.progressTitle')}</h2>
      <Flex
        as="p"
        css={{ ...styles.total }}
        aria-label={t('dashboard.contributing', { count: total.contributing, total: total.total })}
      >
        <span>
          {model.localization.formatNumber(total.contributing)} /{' '}
          {model.localization.formatNumber(total.total)}
          <span className={styles.inlineMeaning}> {t('dashboard.contributingShort')} ·</span>
        </span>
        <span className={styles.percentage}>{total.percentageLabel}%</span>
      </Flex>
      <p className={styles.totalMeaning}>{t('dashboard.countMeaning')}</p>
      {total.attemptCount === 0 ? (
        <p className={styles.caption}>{t('dashboard.firstUse')}</p>
      ) : null}
    </Stack>
  )
}, 'ProgressSummary')
