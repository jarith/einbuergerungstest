import type { RadioGroupProps } from '@mantine/core'
import type { ReactNode, Ref } from 'react'
import { Radio } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { choiceField, choiceGroup, choiceStack } from './choice-group.styles'

export type ChoiceOption = Readonly<{
  value: string
  label: ReactNode
  description?: ReactNode
  marker?: string
  result?: 'correct' | 'incorrect'
  disabled?: boolean
}>

export type ChoiceGroupProps = Omit<PrimitiveProps<RadioGroupProps>, 'children'> &
  Readonly<{ options: readonly ChoiceOption[]; ref?: Ref<HTMLDivElement> }>

/** A keyboard-operable single choice list, with optional answer feedback. */
export const ChoiceGroup = ({ options, ref, ...props }: ChoiceGroupProps) => (
  <Radio.Group {...props} ref={ref} classNames={choiceField()}>
    <div className={choiceStack}>
      {options.map((option) => {
        const classes = choiceGroup({ result: option.result ?? 'none' })

        return (
          <Radio.Card
            key={option.value}
            value={option.value}
            disabled={option.disabled}
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
              <span className={classes.result}>
                {option.result === 'correct' ? 'Correct' : 'Incorrect'}
              </span>
            )}
          </Radio.Card>
        )
      })}
    </div>
  </Radio.Group>
)
