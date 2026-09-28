import { DesignSystemProvider } from '@einbuergerungstest/design-system'
import { reatomComponent } from '@reatom/react'

import { appRoute } from './app.route'

export const App = reatomComponent(
  () => (
    <DesignSystemProvider
      // oxlint-disable-next-line @pandacss/no-dynamic-styling -- Provider state is not a Panda style prop; the plugin treats public-barrel imports as styling APIs.
      colorScheme={appRoute.loader.data()?.localization.appearance() ?? 'light'}
    >
      {appRoute.render()}
    </DesignSystemProvider>
  ),
  'App',
)
