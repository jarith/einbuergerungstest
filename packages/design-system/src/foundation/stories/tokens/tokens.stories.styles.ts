import { css } from '@app/design-system'

export const tokenStyles = {
  content: css({ display: 'grid', gap: 'layout.section', maxWidth: 'content' }),
  swatches: css({ display: 'flex', flexWrap: 'wrap', gap: 'layout.inline' }),
  surface: css({ layerStyle: 'panel', padding: '16' }),
  accent: css({ backgroundColor: 'action.solid.bg', color: 'action.solid.fg', padding: '16' }),
  heading: css({ textStyle: 'heading', margin: '0' }),
  body: css({ textStyle: 'body', margin: '0' }),
  caption: css({ textStyle: 'caption', color: 'content.muted', margin: '0' }),
}
