import type { TextInputProps as MantineProps } from '@mantine/core'
import type { Ref } from 'react'
import { TextInput as MantineTextInput } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { fieldClasses } from './text-input.styles'

export type TextInputProps = PrimitiveProps<MantineProps> &
  Readonly<{ ref?: Ref<HTMLInputElement> }>

export const TextInput = ({ ref, ...props }: TextInputProps) => (
  <MantineTextInput {...props} ref={ref} classNames={fieldClasses()} />
)
