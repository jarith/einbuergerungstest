import type { NavLinkProps } from '@mantine/core'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { NavLink } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { navigationItem } from './navigation-item.styles'

export type NavigationItemProps = PrimitiveProps<NavLinkProps> &
  Omit<ComponentPropsWithoutRef<'button'>, keyof NavLinkProps> &
  Readonly<{ ref?: Ref<HTMLButtonElement> }>

/** A sidebar or menu destination; active items expose their current-page state. */
export const NavigationItem = ({ active = false, ref, ...props }: NavigationItemProps) => (
  <NavLink
    component="button"
    type="button"
    {...props}
    active={active}
    aria-current={active ? 'page' : undefined}
    ref={ref}
    classNames={navigationItem()}
  />
)
