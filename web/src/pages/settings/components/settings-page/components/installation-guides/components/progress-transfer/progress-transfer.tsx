import { Panel } from '@einbuergerungstest/design-system'
import { reatomComponent } from '@reatom/react'

import type { AppResources } from '../../../../../../../../app/bootstrap.model'
import { styles } from '../../installation-guides.styles'

type ProgressTransferProps = Readonly<{ localization: AppResources['localization'] }>

export const ProgressTransfer = reatomComponent(({ localization }: ProgressTransferProps) => {
  const t = localization.t()

  return (
    <Panel tone="muted">
      <h2 className={styles.heading}>{t('installation.transferTitle')}</h2>
      <p>{t('installation.transferHelp')}</p>
      <p className={styles.helper}>{t('installation.separatePreparation')}</p>
    </Panel>
  )
}, 'ProgressTransfer')
