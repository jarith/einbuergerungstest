import { defineRule } from '@oxlint/plugins'

export const rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'reatomRoute') {
          return
        }

        const { filename } = context

        if (!/\.route\.tsx?$/u.test(filename)) {
          context.report({
            node,
            message: 'reatomRoute() calls are only allowed in *.route.ts(x) files.',
          })
        }
      },
    }
  },
})
