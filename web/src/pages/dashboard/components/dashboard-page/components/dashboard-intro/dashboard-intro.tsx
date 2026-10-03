import { ButtonLink } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { BookOpen, ClipboardCheck } from 'lucide-react'

import type { DashboardSectionProps } from '../../dashboard-page'
import { styles } from '../../dashboard-page.styles'

export const DashboardIntro = reatomComponent(({ model }: DashboardSectionProps) => {
  const t = model.localization.t()

  return (
    <Stack gap="16" css={{ ...styles.intro }}>
      <h2 className={styles.title}>{t('dashboard.title')}</h2>
      <Wrap css={{ ...styles.actions }}>
        <ButtonLink href="/study" leftSection={<BookOpen aria-hidden="true" />}>
          {t('dashboard.study')}
        </ButtonLink>
        <ButtonLink
          href="/mock-test"
          appearance="outline"
          leftSection={<ClipboardCheck aria-hidden="true" />}
        >
          {t('mock.start')}
        </ButtonLink>
      </Wrap>
    </Stack>
  )
}, 'DashboardIntro')
