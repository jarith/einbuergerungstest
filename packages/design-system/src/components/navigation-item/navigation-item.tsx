import type { NavLinkProps } from '@mantine/core'
import type { ComponentPropsWithoutRef, Ref } from 'react'
import { NavLink } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { navigationItem } from './navigation-item.styles'

export type NavigationItemProps = PrimitiveProps<NavLinkProps> &
  Omit<ComponentPropsWithoutRef<'a'>, keyof NavLinkProps | 'href'> &
  Readonly<{ href: string; ref?: Ref<HTMLAnchorElement> }>

/** A sidebar or menu destination; active items expose their current-page state. */
export const NavigationItem = ({
  active = false,
  disabled = false,
  href,
  onClick,
  ref,
  ...props
}: NavigationItemProps) => (
  <NavLink
    component="a"
    {...props}
    href={disabled ? undefined : href}
    role={disabled ? 'link' : undefined}
    aria-disabled={disabled || undefined}
    tabIndex={disabled ? -1 : props.tabIndex}
    disabled={disabled}
    onClick={(event) => {
      if (disabled) {
        event.preventDefault()

        return
      }

      onClick?.(event)
    }}
    active={active}
    aria-current={active ? 'page' : undefined}
    ref={ref}
    classNames={navigationItem()}
  />
)
