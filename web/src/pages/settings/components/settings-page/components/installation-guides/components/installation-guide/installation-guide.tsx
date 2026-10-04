import { HStack, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { AppResources } from '../../../../../../../../app/bootstrap.model'
import { styles } from '../../installation-guides.styles'

type InstallationGuideProps = Readonly<{
  localization: AppResources['localization']
  platform: 'ios' | 'android'
}>

const guides = {
  ios: { title: 'stepsTitle', steps: ['safari', 'share', 'home', 'add'] },
  android: { title: 'chromeStepsTitle', steps: ['chrome', 'menu', 'install', 'confirm'] },
} as const

export const InstallationGuide = reatomComponent(
  ({ localization, platform }: InstallationGuideProps) => {
    const t = localization.t()
    const guide = guides[platform]
    const headingId = `${platform}-installation`

    return (
      <Stack as="section" gap="16" minWidth="0" aria-labelledby={headingId}>
        <h2 id={headingId} className={styles.heading}>
          {t(`installation.${guide.title}`)}
        </h2>
        <Stack as="ol" css={styles.steps}>
          {guide.steps.map((step, index) => (
            <HStack as="li" key={step} css={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {index + 1}
              </span>
              <Stack gap="2" minWidth="0">
                <h3 className={styles.stepTitle}>{t(`installation.${step}Title`)}</h3>
                <p className={styles.stepHelp}>{t(`installation.${step}Help`)}</p>
              </Stack>
            </HStack>
          ))}
        </Stack>
      </Stack>
    )
  },
  'InstallationGuide',
)
