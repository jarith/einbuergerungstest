import type { DateInputProps } from '@mantine/dates'
import type { Ref } from 'react'
import { DateInput } from '@mantine/dates'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { calendarClasses } from './calendar.styles'

dayjs.extend(customParseFormat)

export type CalendarProps = Omit<
  PrimitiveProps<DateInputProps>,
  'popoverProps' | 'dateParser' | 'valueFormat' | 'withTime'
> &
  Readonly<{ ref?: Ref<HTMLInputElement> }>

const parseDate = (value: string) => {
  const parsed = dayjs(value, ['DD.MM.YYYY', 'YYYY-MM-DD'], true)

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null
}

/** A themed date field with typed entry and a calendar popup. Values are YYYY-MM-DD or null. */
export const Calendar = ({ ref, clearButtonProps, ...props }: CalendarProps) => {
  const classes = calendarClasses(clearButtonProps?.className)

  return (
    <DateInput
      firstDayOfWeek={1}
      highlightToday
      allowDeselect
      placeholder="DD.MM.YYYY"
      leftSection={<CalendarDays aria-hidden="true" />}
      leftSectionPointerEvents="none"
      nextIcon={<ChevronRight aria-hidden="true" />}
      previousIcon={<ChevronLeft aria-hidden="true" />}
      {...props}
      ref={ref}
      valueFormat="DD.MM.YYYY"
      dateParser={parseDate}
      classNames={classes.field}
      clearButtonProps={{ ...clearButtonProps, className: classes.clearButton }}
      popoverProps={{ classNames: classes.popover, transitionProps: { duration: 0 } }}
    />
  )
}
