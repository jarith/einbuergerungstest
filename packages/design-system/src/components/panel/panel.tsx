import type { PaperProps } from '@mantine/core'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { Paper } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { panel } from './panel.styles'

export type PanelProps = PrimitiveProps<PaperProps> &
  Omit<ComponentPropsWithoutRef<'section'>, keyof PaperProps> &
  Readonly<{ ref?: Ref<HTMLElement> }>

export const Panel = ({ ref, ...props }: PanelProps) => (
  <Paper component="section" {...props} ref={ref} classNames={panel()} />
)
