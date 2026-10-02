import { ButtonLink, Panel } from '@einbuergerungstest/design-system'
import { reatomComponent } from '@reatom/react'
import { Download } from 'lucide-react'

import type { AppResources } from '../../../../../../app/bootstrap.model'
import { styles } from '../../installation-page.styles'

type ProgressTransferProps = Readonly<{ localization: AppResources['localization'] }>

export const ProgressTransfer = reatomComponent(({ localization }: ProgressTransferProps) => {
  const t = localization.t()

  return (
    <Panel tone="muted">
      <Download className={styles.icon} aria-hidden="true" />
      <h2 className={styles.heading}>{t('installation.transferTitle')}</h2>
      <p>{t('installation.transferHelp')}</p>
      <p className={styles.helper}>{t('installation.separatePreparation')}</p>
      <ButtonLink href="/settings" appearance="outline">
        {t('installation.backup')}
      </ButtonLink>
    </Panel>
  )
}, 'ProgressTransfer')
