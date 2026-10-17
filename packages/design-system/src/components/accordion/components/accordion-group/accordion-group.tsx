import type { ReactNode } from 'react'
import { Accordion as MantineAccordion } from '@mantine/core'
import { ChevronUp } from 'lucide-react'
import { createRef } from 'react'

import { HStack, Stack } from '../../../../../styled-system/jsx'
import { Button } from '../../../button/button'
import { styles } from './accordion-group.styles'

type AccordionGroupProps = Readonly<{
  value: string
  title: string
  number?: string
  details?: ReactNode
  children: ReactNode
  closeAction?: Readonly<{ label: string; onClose: () => void }>
}>

/** Shared group surface for Progress and reading pages; Mantine owns disclosure semantics. */
export const AccordionGroup = ({
  value,
  title,
  number,
  details,
  children,
  closeAction,
}: AccordionGroupProps) => {
  const control = createRef<HTMLButtonElement>()

  return (
    <MantineAccordion.Item value={value}>
      <MantineAccordion.Control ref={control}>
        <HStack as="span" gap="16" alignItems="start">
          {number === undefined ? null : <span className={styles.groupNumber}>{number}</span>}
          <Stack as="span" gap="8" minWidth="0" flex="1">
            <span
              className={styles.groupTitle}
              data-numbered={number === undefined ? undefined : true}
            >
              {title}
            </span>
            {details}
          </Stack>
        </HStack>
      </MantineAccordion.Control>
      <MantineAccordion.Panel>
        <Stack
          gap="24"
          className={styles.groupBody}
          data-numbered={number === undefined ? undefined : true}
        >
          {children}
          {closeAction === undefined ? null : (
            <Button
              appearance="outline"
              leftSection={<ChevronUp size={18} aria-hidden="true" />}
              onClick={() => {
                closeAction.onClose()

                control.current?.focus()
              }}
            >
              {closeAction.label}
            </Button>
          )}
        </Stack>
      </MantineAccordion.Panel>
    </MantineAccordion.Item>
  )
}
