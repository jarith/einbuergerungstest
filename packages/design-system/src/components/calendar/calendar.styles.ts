import { cx } from '../../../styled-system/css'
import { calendar } from '../../../styled-system/recipes'
import { fieldClasses } from '../../recipes/field/field.styles'

export const calendarClasses = (clearButtonClassName?: string) => {
  const { dropdown, clearButton, ...dateClasses } = calendar()
  const field = fieldClasses()

  return {
    field: { ...field, ...dateClasses, section: cx(field.section, dateClasses.section) },
    popover: { dropdown },
    clearButton: cx(clearButton, clearButtonClassName),
  }
}
