import type { DividerProps as MantineDividerProps } from '@mantine/core'
import { Divider as MantineDivider } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { divider } from './divider.styles'

export type DividerProps = PrimitiveProps<MantineDividerProps>

/** A section separator using the design's divider color. */
export const Divider = (props: DividerProps) => <MantineDivider {...props} classNames={divider()} />
