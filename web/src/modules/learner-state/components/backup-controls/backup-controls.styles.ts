import { css } from '@einbuergerungstest/design-system'

export const styles = {
  heading: css({ textStyle: 'heading' }),
  helper: css({ textStyle: 'choiceDescription', color: 'content.muted' }),
  table: css({
    width: '[100%]',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    textStyle: 'choiceDescription',
    '& th, & td': {
      textAlign: 'start',
      overflowWrap: 'anywhere',
      paddingBlock: '8',
      paddingInline: '4',
      borderBlockEnd: '{borderWidths.control} solid {colors.panel.border}',
    },
  }),
}
