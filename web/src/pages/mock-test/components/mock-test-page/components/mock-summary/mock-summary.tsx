import { Button, ButtonLink, Panel } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Check, List } from 'lucide-react'
import { memo } from 'react'

import type { MockPageModel } from '../../../../mock-test.model'
import { getAppPath } from '../../../../../../app/offline/app-mode'
import { styles } from '../../mock-test-page.styles'

type MockSummaryProps = Readonly<Pick<MockPageModel, 'mock' | 'localization' | 'picker'>>

export const MockSummary = memo(
  reatomComponent(({ mock, localization, picker }: MockSummaryProps) => {
    const t = localization.t()
    const unanswered = mock.unanswered()
    const isPending = mock.saving()

    return (
      <Stack as="aside" gap="16" minWidth="0">
        <Panel className={styles.summary}>
          <Stack gap="16">
            <h2 className={styles.desktop}>{t('mock.yourTest')}</h2>
            <p className={styles.desktop}>{t('mock.paper')}</p>
            <p className={styles.muted}>{t('mock.changeHelp')}</p>
            <Button
              appearance="outline"
              leftSection={<List size={16} aria-hidden="true" />}
              onClick={wrap(() => picker.set(true))}
            >
              {t('mock.questionList')}
            </Button>
            <p>{t('mock.counts', { answered: 33 - unanswered, unanswered })}</p>
            <Button
              appearance="outline"
              disabled={isPending || mock.hasExpired()}
              leftSection={<Check size={16} aria-hidden="true" />}
              onClick={wrap(() => {
                void mock.submit()
              })}
            >
              {t('mock.submit')}
            </Button>
            {mock.hasExpired() && mock.error() !== null ? (
              <Button
                disabled={isPending}
                onClick={wrap(() => {
                  void mock.expire()
                })}
              >
                {t('common.retry')}
              </Button>
            ) : null}
          </Stack>
        </Panel>
        <ButtonLink href={getAppPath('/dashboard')} appearance="ghost">
          {t('mock.exit')}
        </ButtonLink>
      </Stack>
    )
  }, 'MockSummary'),
)
