import { defineRule } from '@oxlint/plugins'

export const rule = defineRule({
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (node.source !== null) {
          return
        }

        if (node.declaration !== null) {
          return
        }

        if (node.specifiers.length === 0) {
          return
        }

        context.report({
          node,
          message:
            'Use inline named exports. Prefer `export const Foo = ...` over declaring locally and exporting later.',
        })
      },
    }
  },
})
