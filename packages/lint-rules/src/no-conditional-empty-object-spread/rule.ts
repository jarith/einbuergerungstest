/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

function unwrapParentheses(node: ESTree.Node) {
  let current = node
  while (current.type === 'ParenthesizedExpression') {
    current = current.expression
  }
  return current
}

function isEmptyObjectExpression(node: ESTree.Node) {
  return node.type === 'ObjectExpression' && node.properties.length === 0
}

function isConditionalEmptyObjectSpread(node: ESTree.Node) {
  const conditional = unwrapParentheses(node)
  return (
    conditional.type === 'ConditionalExpression' &&
    (isEmptyObjectExpression(conditional.consequent) ||
      isEmptyObjectExpression(conditional.alternate))
  )
}

/** Ban conditional empty-object spreads without changing their omission semantics. */
export const rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow object spreads that conditionally spread an empty object to omit fields.',
    },
    messages: {
      avoid:
        'This conditional spread hides property omission behind an empty object. Build the object in separate statements and add the property only when present.',
    },
  },
  createOnce(context) {
    return {
      SpreadElement(node) {
        if (node.parent.type !== 'ObjectExpression') return

        if (isConditionalEmptyObjectSpread(node.argument)) {
          context.report({ node, messageId: 'avoid' })
        }
      },
    }
  },
})
