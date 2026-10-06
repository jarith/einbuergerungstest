import type { RouteAtom } from '@reatom/core'
import type { JSX } from 'react'

import type { AppResources } from '../bootstrap.model'

// Framework rendering type supported by reatomRoute v1001.
declare module '@reatom/core' {
  interface RouteChild extends JSX.Element {}
}

export type AppRoute = RouteAtom<'/' | '/pwa', {}, {}, AppResources>

export type PageProps<Data = AppResources> = Readonly<{ data: Data }>

export const pageNotFound = () =>
  Object.assign(new Error('The requested page or resource does not exist.'), {
    name: 'PageNotFound',
  })
