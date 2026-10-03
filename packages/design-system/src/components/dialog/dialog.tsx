import type { ModalProps } from '@mantine/core'
import { Modal } from '@mantine/core'

import type { PrimitiveProps } from '../../foundation/mantine/props'
import { token } from '../../foundation/panda/styling'
import { dialog } from './dialog.styles'

export type DialogProps = Omit<PrimitiveProps<ModalProps>, 'transitionProps' | 'overlayProps'> &
  Readonly<{ title: NonNullable<ModalProps['title']> }>

/** Focus-trapped dialog, including full-screen media viewers. */
export const Dialog = (props: DialogProps) => (
  <Modal
    closeButtonProps={{ 'aria-label': 'Close dialog' }}
    centered
    {...props}
    attributes={{
      ...props.attributes,
      header: { ...props.attributes?.header, role: 'presentation' },
    }}
    size={token.var('sizes.dialog.default')}
    transitionProps={{ duration: 0 }}
    overlayProps={{ backgroundOpacity: 1 }}
    classNames={dialog({ fullScreen: props.fullScreen ?? false })}
  />
)
