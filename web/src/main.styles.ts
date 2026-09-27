import { container, css, stack } from '@app/design-system'

export const mainStyles = {
  root: container({ paddingBlock: 'layout.section' }),
  examples: stack({ gap: 'layout.section' }),
  figure: css({ margin: '0', maxWidth: '[30rem]' }),
  image: css({ display: 'block', width: '[100%]', height: 'auto' }),
  caption: css({ marginTop: 'layout.related' }),
}
