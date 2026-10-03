import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ maxWidth: '[42.5rem]', '@media (min-width: 64rem)': { maxWidth: '[none]' } }),
  title: css({ textStyle: 'compactTitle', '@media (min-width: 48rem)': { textStyle: 'title' } }),
}
