import { Button } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Download } from 'lucide-react'

import type { CheatSheetModel } from '../../cheat-sheet.model'
import { PendingNotice } from '../../../../app/components/pending-notice/pending-notice'
import { styles } from '../../cheat-sheet.styles'

type PdfDownloadProps = Readonly<{ model: CheatSheetModel }>

export const PdfDownload = reatomComponent(({ model }: PdfDownloadProps) => {
  const t = model.localization.t()
  const status = model.downloadStatus()

  return (
    <Stack gap="8">
      <Wrap alignItems="center" gap="16">
        <Button
          leftSection={<Download size={18} aria-hidden="true" />}
          disabled={status === 'preparing'}
          onClick={wrap(() => {
            void model.download()
          })}
        >
          {t(status === 'error' ? 'common.retry' : 'cheatSheet.download')}
        </Button>
        <Stack gap="4">
          <p>{t('cheatSheet.pdfDescription', { count: model().groups.length })}</p>
          <p className={styles.muted}>{t('cheatSheet.pdfHint')}</p>
        </Stack>
      </Wrap>
      <output aria-live="polite" className={styles.muted}>
        {status === 'preparing' ? (
          <PendingNotice
            message={t('cheatSheet.preparing')}
            longWaitMessage={t('cheatSheet.longWait')}
          />
        ) : null}
        {status === 'ready' ? <p>{t('cheatSheet.ready')}</p> : null}
        {status === 'error' ? <p>{t('cheatSheet.failed')}</p> : null}
      </output>
    </Stack>
  )
}, 'PdfDownload')
