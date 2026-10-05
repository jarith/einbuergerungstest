import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ width: '[13rem]', maxWidth: '[100%]', flexShrink: '0', gap: '0' }),
  svg: css({ gridArea: '1 / 1', width: '[100%]', height: 'auto', display: 'block' }),
  center: css.raw({
    gridArea: '1 / 1',
    alignSelf: 'center',
    justifySelf: 'center',
    alignItems: 'center',
    maxWidth: '[75%]',
    textAlign: 'center',
    pointerEvents: 'none',
  }),
  percentage: css({ fontSize: '32', fontWeight: 'emphasized', lineHeight: '32' }),
  count: css({ fontSize: '16', fontWeight: 'emphasized', lineHeight: '16' }),
  meaning: css({ textStyle: 'caption', color: 'content.muted' }),
}
