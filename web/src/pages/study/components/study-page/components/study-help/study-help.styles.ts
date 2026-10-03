import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css({
    textStyle: 'caption',
    color: 'content.muted',
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
  icon: css({ width: 'icon.action', height: 'icon.action', flexShrink: '0' }),
}
