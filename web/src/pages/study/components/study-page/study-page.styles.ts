import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({
    maxWidth: '[51.25rem]',
    overflowWrap: 'anywhere',
    hyphens: 'auto',
    '@media (min-width: 64rem)': { maxWidth: '[none]' },
  }),
  scope: css.raw({ textStyle: 'overline', textTransform: 'uppercase' }),
  scopeLabel: css({ minWidth: '0', flex: '1' }),
  position: css({ flexShrink: '0', whiteSpace: 'nowrap' }),
  heading: css({ textStyle: 'heading' }),
  label: css({ textStyle: 'controlLabel' }),
  link: css({ color: 'content.primary' }),
}
