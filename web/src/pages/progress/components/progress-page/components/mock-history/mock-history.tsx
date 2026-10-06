import { Panel, StatusBadge } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'

import type { ProgressPageModel } from '../../../../progress.model'
import { getAppPath } from '../../../../../../app/offline/app-mode'
import { styles } from '../../progress-page.styles'

type MockHistoryProps = Readonly<{ model: ProgressPageModel }>

export const MockHistory = reatomComponent(({ model }: MockHistoryProps) => {
  const t = model.localization.t()
  const mocks = model.mocks()

  return (
    <Stack as="section" gap="16" minWidth="0" aria-labelledby="mock-history-title">
      <h2 id="mock-history-title" className={styles.heading}>
        {t('progress.testHistory')}
      </h2>
      <p className={styles.muted}>{t('progress.mockTotals', model.mockTotals())}</p>
      <Panel className={styles.panel}>
        {mocks.length === 0 ? (
          <p>{t('progress.noMocks')}</p>
        ) : (
          <Stack as="ol" css={styles.list}>
            {mocks.map((mock) => (
              <li key={mock.id}>
                <a
                  href={getAppPath(`/progress/tests/${encodeURIComponent(mock.id)}`)}
                  className={styles.row}
                >
                  <Stack gap="8">
                    <time dateTime={new Date(mock.startedAt).toISOString()}>
                      {model.localization.formatDate(new Date(mock.startedAt), {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </time>
                    <span className={styles.muted}>
                      {mock.status === 'completed'
                        ? t('mock.score', { correct: mock.score, total: mock.total })
                        : t('progress.noScore')}
                    </span>
                  </Stack>
                  <StatusBadge
                    intent={
                      mock.result === 'passed'
                        ? 'success'
                        : mock.result === 'failed'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {t(
                      mock.result === 'passed'
                        ? 'mock.passed'
                        : mock.result === 'failed'
                          ? 'mock.failed'
                          : 'mock.unfinished',
                    )}
                  </StatusBadge>
                </a>
              </li>
            ))}
          </Stack>
        )}
      </Panel>
      <p className={styles.muted}>{t('progress.unfinishedHelp')}</p>
    </Stack>
  )
}, 'MockHistory')
