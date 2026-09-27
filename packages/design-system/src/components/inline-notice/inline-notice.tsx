import type { AlertProps } from '@mantine/core'
import type { Ref } from 'react'
import { Alert } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { inlineNotice } from './inline-notice.styles'

export type InlineNoticeProps = PrimitiveProps<AlertProps> &
  Readonly<{
    intent?: 'success' | 'warning' | 'danger' | 'info'
    role?: 'status' | 'alert' | 'note'
    ref?: Ref<HTMLDivElement>
  }>

/** Inline guidance or feedback; choose a live role only when the content changes. */
export const InlineNotice = ({
  intent = 'info',
  role = 'note',
  ref,
  ...props
}: InlineNoticeProps) => (
  <Alert {...props} role={role} ref={ref} classNames={inlineNotice({ intent })} />
)
