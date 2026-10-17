import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({
    maxWidth: '[760px]',
    fontSize: '16',
    lineHeight: '[1.6]',
    '& strong': { fontWeight: 'semibold' },
  }),
  list: css({
    paddingInlineStart: '20',
    '& li[data-leading-term] > strong:first-child': { display: 'block' },
  }),
  heading: css({ fontSize: '18', lineHeight: '16', fontWeight: 'semibold' }),
}
