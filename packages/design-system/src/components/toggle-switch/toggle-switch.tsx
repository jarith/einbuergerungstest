import type { SwitchProps } from '@mantine/core'
import { Switch } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { toggleSwitch } from './toggle-switch.styles'

export type ToggleSwitchProps = PrimitiveProps<SwitchProps>

/** A binary preference control, such as the question translation setting. */
export const ToggleSwitch = (props: ToggleSwitchProps) => (
  <Switch onLabel="ON" offLabel="OFF" {...props} classNames={toggleSwitch()} />
)
