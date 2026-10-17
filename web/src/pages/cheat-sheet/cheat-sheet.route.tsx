import type { ReactElement } from 'react'
import { computed, wrap } from '@reatom/core'

import type { AppRoute } from '../../app/routing'
import { RoutePage } from '../../app/routing'
import { CheatSheetPage } from './cheat-sheet'
import { createCheatSheetModel } from './cheat-sheet.model'

export const createCheatSheetRoute = (parent: AppRoute) => {
  const model = computed(() => {
    const resources = parent.loader.data()

    return resources === undefined ? undefined : createCheatSheetModel(resources)
  }, 'cheatSheetRoute.model')

  return parent.reatomRoute(
    {
      path: 'cheat-sheet',
      loader: async () => {
        await wrap(parent.loader())

        const pageModel = model()

        if (pageModel === undefined) {
          throw new Error('Cheat sheet is not available. Reload the page to try again.')
        }

        return { model: pageModel }
      },
      render: (self): ReactElement => (
        <RoutePage
          loader={self.loader}
          page={CheatSheetPage}
          language={parent.loader.data()?.localization.language()}
        />
      ),
    },
    'cheatSheetRoute',
  )
}
