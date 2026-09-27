import { css, grid } from '@app/design-system'

export const tokenStyles = {
  content: css({ display: 'grid', gap: 'layout.section', maxWidth: 'content' }),
  swatches: grid({ gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }),
  swatch: css({ padding: '16', borderRadius: 'panel', textStyle: 'caption' }),
  canvas: css({
    backgroundColor: 'canvas',
    color: 'content.primary',
    border: '{borderWidths.control} solid {colors.panel.border}',
  }),
  surface: css({
    backgroundColor: 'panel.bg',
    color: 'content.primary',
    border: '{borderWidths.control} solid {colors.panel.border}',
  }),
  muted: css({ backgroundColor: 'surface-muted', color: 'content.primary' }),
  accent: css({ backgroundColor: 'action.solid.bg', color: 'action.solid.fg' }),
  success: css({ backgroundColor: 'badge.success.bg', color: 'badge.success.fg' }),
  warning: css({ backgroundColor: 'badge.warning.bg', color: 'badge.warning.fg' }),
  danger: css({ backgroundColor: 'badge.danger.bg', color: 'badge.danger.fg' }),
  info: css({ backgroundColor: 'badge.info.bg', color: 'badge.info.fg' }),
  heading: css({ textStyle: 'heading', margin: '0' }),
  body: css({ textStyle: 'body', margin: '0' }),
  caption: css({ textStyle: 'caption', color: 'content.muted', margin: '0' }),
}
