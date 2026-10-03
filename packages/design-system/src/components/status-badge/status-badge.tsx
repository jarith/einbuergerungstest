import type { BadgeProps } from '@mantine/core'
import type { Ref } from 'react'
import { Badge } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { statusBadge } from './status-badge.styles'

export type StatusBadgeProps = PrimitiveProps<BadgeProps> &
  Readonly<{
    intent?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'learning'
    ref?: Ref<HTMLDivElement>
  }>

/** A compact text status for saved answers, progress, and warnings. */
export const StatusBadge = ({ intent = 'neutral', ref, ...props }: StatusBadgeProps) => (
  <Badge {...props} ref={ref} classNames={statusBadge({ intent })} />
)
