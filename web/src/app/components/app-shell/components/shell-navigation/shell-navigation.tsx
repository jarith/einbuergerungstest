import type { LucideIcon } from 'lucide-react'
import { NavigationItem } from '@einbuergerungstest/design-system'
import { Grid } from '@einbuergerungstest/design-system/jsx'

import { styles } from './shell-navigation.styles'

export type Destination = Readonly<{
  label: string
  icon: LucideIcon
  active: boolean
  href: string
}>

type ShellNavigationProps = Readonly<{
  label: string
  destinations: readonly Destination[]
}>

export const ShellNavigation = ({ label, destinations }: ShellNavigationProps) => (
  <Grid as="nav" aria-label={label} css={{ ...styles.navigation }}>
    {destinations.map(({ icon: Icon, ...destination }) => (
      <NavigationItem
        key={destination.href}
        label={<span className={styles.navLabel}>{destination.label}</span>}
        leftSection={<Icon aria-hidden="true" focusable="false" className={styles.icon} />}
        active={destination.active}
        href={destination.href}
        className={styles.navItem}
      />
    ))}
  </Grid>
)
