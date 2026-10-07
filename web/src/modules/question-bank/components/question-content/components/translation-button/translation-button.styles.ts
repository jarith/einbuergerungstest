import { css } from '@einbuergerungstest/design-system'

export const styles = {
  button: css({ position: 'relative', flexShrink: 0 }),
  icon: css({ width: 'icon.translation', height: 'icon.translation' }),
  indicator: css({
    position: 'absolute',
    insetBlockStart: '2',
    insetInlineEnd: '2',
    width: 'icon.indicator',
    height: 'icon.indicator',
  }),
}
