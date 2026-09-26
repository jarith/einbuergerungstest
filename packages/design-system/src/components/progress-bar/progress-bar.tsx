import type { ProgressProps } from '@mantine/core'
import type { Ref } from 'react'
import { Progress } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { progressBar } from './progress-bar.styles'

export type ProgressBarProps = PrimitiveProps<ProgressProps> &
  Readonly<{ 'aria-label': string; ref?: Ref<HTMLDivElement> }>

/** A named percentage track for question group progress. */
export const ProgressBar = ({ ref, ...props }: ProgressBarProps) => (
  <Progress {...props} ref={ref} classNames={progressBar()} />
)
