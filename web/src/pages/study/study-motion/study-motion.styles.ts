import { css } from '@einbuergerungstest/design-system'

export const styles = {
  question: css({
    position: 'relative',
    minWidth: '0',
    overflow: 'clip',
    overflowClipMargin: '{spacing.8}',
  }),
  outgoing: css({
    position: 'absolute',
    insetBlockStart: '0',
    insetInline: '0',
    pointerEvents: 'none',
    '& *': { animation: 'none', transition: '[none]' },
  }),
}
