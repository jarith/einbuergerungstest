import { Button, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { MockTestData } from '../../mock-test.route'
import { MockSession } from './components/mock-session/mock-session'
import { styles } from './mock-test-page.styles'

export const MockTestPage = reatomComponent(({ data }: PageProps<MockTestData>) => {
  const { model } = data
  const t = model.localization.t()

  return (
    <Stack gap="24" css={styles.root} ref={wrap(model.connect)}>
      {model.mock.error() === null ? null : (
        <InlineNotice intent="danger" role="alert">
          {t('errors.storage')}
        </InlineNotice>
      )}
      {model().sitting === null ? (
        <Stack gap="24" alignItems="start">
          <h1 className={styles.title}>{t('mock.start')}</h1>
          <p>{t('mock.introduction')}</p>
          <p>{t('mock.rules')}</p>
          <Button
            disabled={model.mock.pending()}
            onClick={wrap(() => {
              void model.start()
            })}
          >
            {t('mock.start')}
          </Button>
        </Stack>
      ) : (
        <MockSession model={model} />
      )}
    </Stack>
  )
}, 'MockTestPage')
