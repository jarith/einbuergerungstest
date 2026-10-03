import { Button, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../../../app/routing'
import type { MockTestData } from '../../mock-test.route'
import { MockIntro } from './components/mock-intro/mock-intro'
import { MockSession } from './components/mock-session/mock-session'
import { styles } from './mock-test-page.styles'

export const MockTestPage = reatomComponent(({ data }: PageProps<MockTestData>) => {
  const { model } = data
  const t = model.localization.t()

  return (
    <Stack gap="24" css={styles.root} ref={wrap(model.connect)}>
      {model.mock.error() === null ? null : (
        <InlineNotice intent="danger" role="alert">
          {t(model.hasConflict() ? 'errors.storageConflict' : 'errors.storage')}
          {model.hasConflict() ? (
            <Button onClick={wrap(model.reload)}>{t('common.reload')}</Button>
          ) : null}
        </InlineNotice>
      )}
      {model().sitting === null ? <MockIntro model={model} /> : <MockSession model={model} />}
    </Stack>
  )
}, 'MockTestPage')
