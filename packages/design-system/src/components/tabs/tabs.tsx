import type {
  TabsProps as MantineTabsProps,
  TabsListProps,
  TabsTabProps,
  TabsPanelProps,
} from '@mantine/core'
import { Tabs as MantineTabs } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { tabs } from './tabs.styles'

export type TabsProps = PrimitiveProps<MantineTabsProps>

/** Controlled or local tabs with Mantine's roving focus and panel semantics. */
export const Tabs = (props: TabsProps) => <MantineTabs {...props} classNames={tabs()} />

Tabs.List = (props: PrimitiveProps<TabsListProps>) => <MantineTabs.List {...props} />

Tabs.Tab = (props: PrimitiveProps<TabsTabProps>) => <MantineTabs.Tab {...props} />

Tabs.Panel = (props: PrimitiveProps<TabsPanelProps>) => <MantineTabs.Panel {...props} />
