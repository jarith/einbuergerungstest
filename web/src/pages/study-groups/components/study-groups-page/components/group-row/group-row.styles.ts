import { css } from '@einbuergerungstest/design-system'

export const styles = {
  row: css.raw({
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '16',
    paddingBlock: '16',
  }),
  number: css({ textStyle: 'overline', color: 'accent' }),
  title: css({ textStyle: 'controlLabel' }),
  description: css({ textStyle: 'choiceDescription', color: 'content.muted' }),
  metadata: css({ textStyle: 'caption', color: 'content.muted' }),
}
