import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { StudySessionProps } from '../study-session/study-session'
import { styles } from '../../study-page.styles'
import { StudyProgress } from './components/study-progress/study-progress'

export const StudyHeader = reatomComponent(({ model }: StudySessionProps) => {
  const current = model()
  const t = model.localization.t()

  return (
    <Stack gap="8" minWidth="0">
      <Flex justify="space-between" gap="16" css={{ ...styles.scope }}>
        <span className={styles.scopeLabel}>
          {t(model.isGroup ? 'navigation.groups' : 'navigation.study')} / {model.scope()}
        </span>
        <span
          className={styles.position}
          aria-label={t('common.questionPosition', {
            current: current.index + 1,
            total: current.total,
          })}
        >
          {current.index + 1}/{current.total}
        </span>
      </Flex>
      <StudyProgress
        totals={model.totals()}
        title={model.scope()}
        percentageLabel={model.localization.formatNumber(model.totals().percentage)}
        t={t}
      />
    </Stack>
  )
}, 'StudyHeader')
