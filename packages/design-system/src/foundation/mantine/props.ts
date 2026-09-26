import type { MantineStyleProps } from '@mantine/core'

/** className and style are intentional escape hatches; vendor visual knobs stay private. */
export type PrimitiveProps<T> = Omit<
  T,
  | keyof MantineStyleProps
  | 'classNames'
  | 'styles'
  | 'vars'
  | 'unstyled'
  | 'variant'
  | 'color'
  | 'radius'
  | 'size'
  | 'gradient'
  | 'autoContrast'
>

export type Appearance = 'solid' | 'outline' | 'ghost'
