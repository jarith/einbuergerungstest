import { css } from '@app/design-system'

export const appStyles = {
  page: css({ maxWidth: 'content', marginInline: 'auto', padding: 'panel.padding' }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'layout.section',
    flexWrap: 'wrap',
    marginBlock: '32',
  }),
  title: css({ textStyle: 'title', letterSpacing: '-0.03em', margin: '0' }),
  subtitle: css({ color: 'content.muted', textStyle: 'caption', marginTop: '8' }),
  footer: css({ color: 'content.muted', textStyle: 'caption', marginBlock: '24' }),
}
