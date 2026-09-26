import { defineRule } from '@oxlint/plugins'

export const rule = defineRule({
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind !== 'let') {
          return
        }

        if (node.parent.type === 'ForStatement') {
          return
        }

        context.report({
          node,
          message: 'Unexpected let, use const instead.',
        })
      },
    }
  },
})
