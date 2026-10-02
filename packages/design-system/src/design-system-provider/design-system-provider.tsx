import type { ReactNode } from 'react'
import { MantineProvider } from '@mantine/core'
// oxlint-disable-next-line eslint/no-restricted-imports -- The design system provider intentionally uses Mantine's SSR-safe effect.
import { useIsomorphicEffect } from '@mantine/hooks'

import { cssVariablesResolver, mantineTheme } from '../foundation/mantine/mantine-theme'

export type DesignSystemProviderProps = Readonly<{
  children: ReactNode
  colorScheme?: 'light' | 'dark'
  skin?: 'baseline' | 'alternate'
}>

/** Shared visual root for the app, stories and browser tests; owns no product state. */
export const DesignSystemProvider = ({
  children,
  colorScheme = 'light',
  skin = 'baseline',
}: DesignSystemProviderProps) => {
  useIsomorphicEffect(() => {
    document.documentElement.dataset['dsTheme'] = skin
  }, [skin])

  return (
    <MantineProvider
      theme={mantineTheme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme={colorScheme}
    >
      {children}
    </MantineProvider>
  )
}
