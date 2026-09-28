import { css } from '@einbuergerungstest/design-system'

export const tokenStyles = {
  swatch: css({ padding: '16', borderRadius: 'panel', textStyle: 'caption' }),
  canvas: css({
    background: 'canvas',
    color: 'content.primary',
    border: '{borderWidths.control} solid {colors.panel.border}',
  }),
  surface: css({
    background: 'panel.bg',
    color: 'content.primary',
    border: '{borderWidths.control} solid {colors.panel.border}',
  }),
  muted: css({ background: 'surface-muted', color: 'content.primary' }),
  accent: css({ background: 'action.solid.bg', color: 'action.solid.fg' }),
  success: css({ background: 'badge.success.bg', color: 'badge.success.fg' }),
  warning: css({ background: 'badge.warning.bg', color: 'badge.warning.fg' }),
  danger: css({ background: 'badge.danger.bg', color: 'badge.danger.fg' }),
  info: css({ background: 'badge.info.bg', color: 'badge.info.fg' }),
  heading: css({ textStyle: 'heading' }),
  body: css({ textStyle: 'body' }),
  caption: css({ textStyle: 'caption', color: 'content.muted' }),
}
