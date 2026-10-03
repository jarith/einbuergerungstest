import type { ProgressProps } from '@mantine/core'
import type { Ref } from 'react'
import { Progress } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { progressBar } from './progress-bar.styles'

export type ProgressBarProps = PrimitiveProps<ProgressProps> &
  Readonly<{ 'aria-label': string; ref?: Ref<HTMLDivElement> }>

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Mantine uses a compound div track; its root owns the exact-count progress semantics. */
/** A named percentage track for question group progress. */
export const ProgressBar = ({ ref, value, striped, animated, ...props }: ProgressBarProps) => (
  <Progress.Root
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
    aria-valuetext={`${value}%`}
    {...props}
    ref={ref}
    classNames={progressBar()}
  >
    <Progress.Section
      value={value}
      striped={striped ?? false}
      animated={animated ?? false}
      withAria={false}
    />
  </Progress.Root>
)
