import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css({
    display: 'block',
    width: '[100%]',
    height: 'progress.track',
    borderRadius: 'progress',
    border: '{borderWidths.control} solid {colors.panel.border}',
    overflow: 'hidden',
    _focusVisible: { layerStyle: 'focus' },
  }),
}
