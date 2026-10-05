import type { RouteLoader } from '@reatom/core'
import type { ComponentType } from 'react'
import { Box } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../route-context'
import { browserNavigationAtom } from '../../../../shared/navigation/browser-navigation.model'
import { RouteStatus } from '../route-status/route-status'

type RoutePageProps<Params extends object, Data> = Readonly<{
  loader: RouteLoader<Params, Data>
  page: ComponentType<PageProps<Data>>
  language?: 'en' | 'de' | undefined
}>

export const RoutePage = reatomComponent(
  <Params extends object, Data>({ loader, page: Page, language }: RoutePageProps<Params, Data>) => {
    // Keep the active loader connected so parent retries refresh its data.
    void loader()

    // A parent retry can fulfill this loader while its previous error is still retained.
    const error = loader.status().isRejected ? loader.error() : undefined
    const data = loader.data()

    if (error !== undefined || !loader.ready() || data === undefined) {
      return (
        <Box
          display="contents"
          ref={error === undefined ? undefined : wrap(browserNavigationAtom.complete)}
        >
          <RouteStatus
            error={error}
            language={language}
            retry={wrap(() => {
              void loader.retry()
            })}
          />
        </Box>
      )
    }

    return (
      <Box display="contents" ref={wrap(browserNavigationAtom.complete)}>
        <Page data={data} />
      </Box>
    )
  },
  'RoutePage',
)
