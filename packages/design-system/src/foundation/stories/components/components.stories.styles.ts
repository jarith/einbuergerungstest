import { css, hstack, stack, toolbar } from '@einbuergerungstest/design-system'

export const studyStyles = {
  root: stack({ gap: 'layout.section', maxWidth: 'content' }),
  heading: css({ textStyle: 'heading', margin: '0' }),
  translation: css({ textStyle: 'caption', color: 'content.muted', margin: '0' }),
  status: hstack({ gap: 'layout.inline', flexWrap: 'wrap' }),
  actions: toolbar({ justifyContent: 'space-between' }),
}
