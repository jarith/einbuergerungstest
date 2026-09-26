import { defineRule } from '@oxlint/plugins'

export const rule = defineRule({
  create(context) {
    return {
      ClassDeclaration(node) {
        context.report({
          node,
          message: 'Unexpected class, use functions instead.',
        })
      },
      ClassExpression(node) {
        context.report({
          node,
          message: 'Unexpected class, use functions instead.',
        })
      },
    }
  },
})
