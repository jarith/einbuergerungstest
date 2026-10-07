import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css({
    textStyle: 'caption',
    color: 'content.muted',
    '&::details-content': {
      _motionReduce: { transition: '[none]' },
      interpolateSize: 'allow-keywords',
      blockSize: '0',
      opacity: '[0]',
      overflow: 'clip',
      transition:
        '[block-size {durations.feedback} {easings.enter}, opacity {durations.feedback} {easings.enter}, content-visibility {durations.feedback} allow-discrete]',
    },
    '&[open]::details-content': { blockSize: 'auto', opacity: '[1]', transitionDuration: 'reveal' },
    '&[open] summary svg': { transform: 'rotate(180deg)' },
  }),
  trigger: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8',
    minHeight: 'control.field',
    cursor: 'pointer',
    listStyle: 'none',
    '&::-webkit-details-marker': { display: 'none' },
    _focusVisible: { layerStyle: 'focus' },
  }),
  icon: css({
    transition: '[transform {durations.backdrop} {easings.enter}]',
    width: 'icon.action',
    height: 'icon.action',
    flexShrink: '0',
  }),
}
