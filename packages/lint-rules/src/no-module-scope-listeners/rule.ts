import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const FUNCTION_LIKE = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
])

const isInsideFunctionBody = (node: ESTree.Node) => {
  for (let current = node; current.parent; current = current.parent) {
    if (FUNCTION_LIKE.has(current.parent.type)) {
      return true
    }
  }

  return false
}

export const rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node

        if (
          callee.type !== 'MemberExpression' ||
          callee.object.type !== 'Identifier' ||
          callee.property.type !== 'Identifier' ||
          callee.property.name !== 'addEventListener'
        ) {
          return
        }

        const objectName = callee.object.name

        if (objectName !== 'document' && objectName !== 'window') {
          return
        }

        if (isInsideFunctionBody(node)) {
          return
        }

        context.report({
          node,
          message: `${objectName}.addEventListener() must be called inside a function body, not at module scope.`,
        })
      },
    }
  },
})
