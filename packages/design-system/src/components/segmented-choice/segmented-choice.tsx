import type { SegmentedControlProps } from '@mantine/core'
import type { Ref } from 'react'
import { SegmentedControl } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { segmentedChoice } from './segmented-choice.styles'

export type SegmentedChoiceProps = Omit<PrimitiveProps<SegmentedControlProps>, 'withItemsBorders'> &
  Readonly<{
    'aria-label': string
    density?: 'regular' | 'compact'
    ref?: Ref<HTMLDivElement>
  }>

/** A compact, mutually exclusive filter or preference selector. */
export const SegmentedChoice = ({ density = 'regular', ref, ...props }: SegmentedChoiceProps) => (
  <SegmentedControl
    {...props}
    ref={ref}
    withItemsBorders={false}
    classNames={segmentedChoice({ density })}
  />
)
