import type { TooltipProps as MantineProps } from '@mantine/core'
import { Tooltip as MantineTooltip } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { tooltip } from './tooltip.styles'

export type TooltipProps = Omit<PrimitiveProps<MantineProps>, 'transitionProps'>

export const Tooltip = (props: TooltipProps) => (
  <MantineTooltip
    events={{ hover: true, focus: true, touch: false }}
    interactive
    multiline
    offset={8}
    {...props}
    transitionProps={{ duration: 0 }}
    classNames={tooltip()}
  />
)
