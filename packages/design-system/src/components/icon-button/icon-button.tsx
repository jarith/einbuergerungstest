import type { ActionIconProps } from '@mantine/core'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { ActionIcon } from '@mantine/core'

import type { Appearance, PrimitiveProps } from '../../foundation/mantine/props'
import { iconButton } from './icon-button.styles'

export type IconButtonProps = PrimitiveProps<ActionIconProps> &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ActionIconProps> &
  Readonly<{ 'aria-label': string; appearance?: Appearance; ref?: Ref<HTMLButtonElement> }>

/** An icon-only action with a required accessible name. */
export const IconButton = ({ appearance = 'outline', ref, ...props }: IconButtonProps) => (
  <ActionIcon {...props} ref={ref} classNames={iconButton({ appearance })} />
)
