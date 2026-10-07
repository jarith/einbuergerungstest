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
    transitionProps={{
      duration: Number.parseFloat(token('durations.navigation')),
      exitDuration: Number.parseFloat(token('durations.feedback')),
      timingFunction: token('easings.enter'),
      transition: {
        in: { opacity: 1, transform: 'translateY(0)' },
        out: {
          opacity: 0,
          transform:
            props.opened && props.fullScreen !== true
              ? `translateY(${token.var('spacing.8')})`
              : 'translateY(0)',
        },
        transitionProperty: 'opacity, transform',
      },
    }}
    overlayProps={{
      backgroundOpacity: 1,
      transitionProps: {
        duration: Number.parseFloat(token('durations.backdrop')),
        exitDuration: Number.parseFloat(token('durations.icon')),
        timingFunction: token('easings.enter'),
      },
    }}
    classNames={dialog({ fullScreen: props.fullScreen ?? false })}
  />
)
