import type { ButtonProps as MantineProps } from '@mantine/core'
import type { ComponentPropsWithoutRef } from 'react'
import { Button as MantineButton } from '@mantine/core'

import type { Appearance, PrimitiveProps } from '../../foundation/mantine/props'
import { buttonLink } from './button-link.styles'

type ButtonLinkProps = PrimitiveProps<MantineProps> &
  Omit<ComponentPropsWithoutRef<'a'>, keyof MantineProps> &
  Readonly<{ href: string; appearance?: Appearance }>

export const ButtonLink = ({ appearance = 'solid', ...props }: ButtonLinkProps) => (
  <MantineButton component="a" {...props} classNames={buttonLink({ appearance })} />
)
