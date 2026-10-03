import { css } from '@einbuergerungstest/design-system'

export const styles = {
  facts: css.raw({
    width: '[100%]',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16',
    paddingBlock: '16',
    borderBlock: '{borderWidths.control} solid {colors.surface-raised}',
  }),
  fact: css.raw({ flexDirection: 'column', gap: '8', textStyle: 'caption' }),
  factValue: css({ fontSize: '28', fontWeight: 'bold', color: 'content.primary' }),
}
