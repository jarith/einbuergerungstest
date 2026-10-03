import type { RouteLoader } from '@reatom/core'
import type { ComponentType } from 'react'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../route-context'
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
        <RouteStatus
          error={error}
          language={language}
          retry={wrap(() => {
            void loader.retry()
          })}
        />
      )
    }

    return <Page data={data} />
  },
  'RoutePage',
)
