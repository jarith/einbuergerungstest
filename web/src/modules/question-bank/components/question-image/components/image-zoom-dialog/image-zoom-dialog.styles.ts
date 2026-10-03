import { css } from '@einbuergerungstest/design-system'

export const styles = {
  layout: css.raw({ flex: '1', minHeight: '0' }),
  viewport: css({
    flex: '1',
    minHeight: '0',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    containerType: 'size',
    '--image-zoom': '1',
    '&[data-zoom="2"]': { '--image-zoom': '2' },
    '&[data-zoom="3"]': { '--image-zoom': '3' },
  }),
  canvas: css.raw({
    width: 'max-content',
    minWidth: '[100%]',
    minHeight: '[100%]',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  image: css({
    display: 'block',
    width: '[calc(min(100cqw, 100cqh * var(--image-ratio)) * var(--image-zoom))]',
    height: 'auto',
    maxWidth: '[none]',
    flexShrink: '0',
  }),
  controls: css.raw({
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
  }),
  zoomLevel: css({
    minWidth: '[4ch]',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  }),
  help: css({ textStyle: 'caption', color: 'content.muted', textAlign: 'center' }),
}
