import { HStack, Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { AppResources } from '../../../../../../app/bootstrap.model'
import { styles } from '../../installation-page.styles'

type InstallationStepsProps = Readonly<{ localization: AppResources['localization'] }>

const steps = ['safari', 'share', 'home', 'add'] as const

export const InstallationSteps = reatomComponent(({ localization }: InstallationStepsProps) => {
  const t = localization.t()

  return (
    <Stack as="section" gap="16" aria-labelledby="installation-steps">
      <h2 id="installation-steps" className={styles.heading}>
        {t('installation.stepsTitle')}
      </h2>
      <Stack as="ol" css={styles.steps}>
        {steps.map((step, index) => (
          <HStack as="li" key={step} css={styles.step}>
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <Stack gap="8" minWidth="0">
              <h3 className={styles.stepTitle}>{t(`installation.${step}Title`)}</h3>
              <p className={styles.helper}>{t(`installation.${step}Help`)}</p>
            </Stack>
          </HStack>
        ))}
      </Stack>
    </Stack>
  )
}, 'InstallationSteps')
