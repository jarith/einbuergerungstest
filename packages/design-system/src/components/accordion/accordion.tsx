import type {
  AccordionProps as MantineAccordionProps,
  AccordionItemProps,
  AccordionControlProps,
  AccordionPanelProps,
} from '@mantine/core'
import { Accordion as MantineAccordion } from '@mantine/core'
import { ChevronDown } from 'lucide-react'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { token } from '../../foundation/panda/styling'
import { accordion } from './accordion.styles'

export type AccordionProps<Multiple extends boolean = false> = Omit<
  PrimitiveProps<MantineAccordionProps<Multiple>>,
  'transitionDuration' | 'chevronSize' | 'chevronIconSize'
> & { appearance?: 'inline' | 'separated' }

/** Inline disclosure groups with keyboard navigation and full-width touch controls. */
export const Accordion = <Multiple extends boolean = false>({
  appearance,
  ...props
}: AccordionProps<Multiple>) => (
  <MantineAccordion
    order={3}
    chevron={<ChevronDown size={18} aria-hidden="true" />}
    {...props}
    transitionDuration={Number.parseFloat(token('durations.reveal'))}
    classNames={accordion({ appearance })}
  />
)

Accordion.Item = (props: PrimitiveProps<AccordionItemProps>) => <MantineAccordion.Item {...props} />

Accordion.Control = (props: PrimitiveProps<AccordionControlProps>) => (
  <MantineAccordion.Control {...props} />
)

Accordion.Panel = (props: PrimitiveProps<AccordionPanelProps>) => (
  <MantineAccordion.Panel {...props} />
)
