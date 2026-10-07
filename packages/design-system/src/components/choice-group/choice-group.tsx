import type { RadioGroupProps } from '@mantine/core'
import type { ReactNode, Ref } from 'react'
import { Radio } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { Stack } from '../../../styled-system/jsx'
import { cx } from '../../foundation/panda/styling'
import { choiceField, choiceGroup, hiddenLabel } from './choice-group.styles'

export type ChoiceOption = Readonly<{
  value: string
  label: ReactNode
  description?: ReactNode
  marker?: string
  result?: 'correct' | 'incorrect'
  resultLabel?: ReactNode
  disabled?: boolean
}>

export type ChoiceGroupProps = Omit<PrimitiveProps<RadioGroupProps>, 'children'> &
  Readonly<{
    options: readonly ChoiceOption[]
    density?: 'regular' | 'compact'
    animateFeedback?: boolean
    readOnly?: boolean
    ref?: Ref<HTMLDivElement>
  }>

/**
 * A keyboard-operable single choice list, with optional answer feedback.
 * Mantine names its inner radiogroup through label context; aria-label alone names only the wrapper.
 */
export const ChoiceGroup = ({
  options,
  density = 'regular',
  animateFeedback = false,
  readOnly = false,
  onChange,
  ref,
  label,
  labelProps,
  'aria-label': accessibleLabel,
  ...props
}: ChoiceGroupProps) => (
  <Radio.Group
    {...props}
    label={label ?? accessibleLabel}
    labelProps={{
      ...labelProps,
      className: cx(labelProps?.className, label == null ? hiddenLabel : undefined),
    }}
    onChange={(value) => {
      if (!readOnly) {
        onChange?.(value)
      }
    }}
    ref={ref}
    classNames={choiceField()}
  >
    <Stack gap="layout.inline">
      {options.map((option) => {
        const classes = choiceGroup({ density, result: option.result ?? 'none' })

        return (
          <Radio.Card
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            aria-disabled={readOnly || option.disabled}
            className={classes.card}
          >
            {option.marker !== undefined && option.marker !== '' && (
              <span className={classes.marker}>{option.marker}</span>
            )}
            <span className={classes.body}>
              <span className={classes.label}>{option.label}</span>
              {option.description !== undefined && option.description !== null && (
                <span className={classes.description}>{option.description}</span>
              )}
            </span>
            {option.result && (
              <span className={classes.result} data-animate={animateFeedback}>
                {option.resultLabel ?? (option.result === 'correct' ? 'Correct' : 'Incorrect')}
              </span>
            )}
          </Radio.Card>
        )
      })}
    </Stack>
  </Radio.Group>
)
