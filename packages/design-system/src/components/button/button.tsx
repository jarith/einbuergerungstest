import type { ButtonProps as MantineProps } from '@mantine/core'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { Button as MantineButton } from '@mantine/core'

import type { Appearance, PrimitiveProps } from '../../foundation/mantine/props'
import { button } from './button.styles'

export type ButtonProps = PrimitiveProps<MantineProps> &
  Omit<ComponentPropsWithoutRef<'button'>, keyof MantineProps> &
  Readonly<{ appearance?: Appearance; ref?: Ref<HTMLButtonElement> }>

export const Button = ({ appearance = 'solid', ref, ...props }: ButtonProps) => (
  <MantineButton {...props} ref={ref} classNames={button({ appearance })} />
)
