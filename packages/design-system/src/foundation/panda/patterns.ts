import type { PatternConfig, SystemStyleObject } from '@pandacss/types'
import { definePattern } from '@pandacss/dev'

export const patterns = {
  extend: {
    stack: { defaultValues: { gap: 'layout.section' } },
    hstack: { defaultValues: { gap: 'layout.inline' } },
    vstack: { defaultValues: { gap: 'layout.section' } },
    wrap: { defaultValues: { gap: 'layout.inline' } },
    grid: { defaultValues: { gap: 'layout.section' } },
    container: {
      transform: (props: SystemStyleObject) => ({
        width: '100%',
        maxWidth: 'content',
        marginInline: 'auto',
        paddingInline: 'panel.padding',
        ...props,
      }),
    },
    toolbar: definePattern<PatternConfig>({
      properties: { gap: { type: 'property', value: 'gap' } },
      defaultValues: { gap: 'layout.inline' },
      transform: (props) => ({
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        minWidth: 0,
        ...props,
      }),
    }),
  },
}
