import { css } from '@einbuergerungstest/design-system'

export const styles = {
  root: css.raw({ gridArea: 'summary', minWidth: '0', gap: '16', alignItems: 'center' }),
  chartAndLegend: css.raw({
    width: '[100%]',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16',
    '@media (min-width: 48rem)': { flexDirection: 'row', gap: '48' },
  }),
  caption: css({ textStyle: 'caption', color: 'content.muted', textAlign: 'center' }),
}
