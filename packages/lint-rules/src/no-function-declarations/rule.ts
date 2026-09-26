import { defineRule } from '@oxlint/plugins'

export const rule = defineRule({
  create(context) {
    return {
      FunctionDeclaration(node) {
        context.report({
          node,
          message: 'Function declarations are not allowed. Use arrow function expressions instead.',
        })
      },
    }
  },
})
