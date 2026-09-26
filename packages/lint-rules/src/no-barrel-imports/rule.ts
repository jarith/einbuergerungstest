import { defineRule } from '@oxlint/plugins'

export const rule = defineRule({
  create(context) {
    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            context.report({
              node,
              message:
                'Namespace imports (import * as) are not allowed. Use named imports instead.',
            })
          }
        }
      },
      ExportAllDeclaration(node) {
        context.report({
          node,
          message:
            'Wildcard re-exports (export * from) are not allowed. Use named re-exports instead.',
        })
      },
    }
  },
})
