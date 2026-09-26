/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

type Assertion = ESTree.TSAsExpression | ESTree.TSTypeAssertion

function isTypeAssertionExpression(node: ESTree.Node | null): node is Assertion {
  return node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion'
}

function unwrapParenthesizedExpression(expression: ESTree.Node) {
  let current = expression
  while (current.type === 'ParenthesizedExpression') {
    current = current.expression
  }
  return current
}

function isConstAssertion(node: Assertion) {
  const { typeAnnotation } = node
  return (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'const'
  )
}

function isOutermostAssertionInChain(node: Assertion) {
  let current: ESTree.Node = node
  let parent = node.parent

  while (parent?.type === 'ParenthesizedExpression' && parent.expression === current) {
    current = parent
    parent = parent.parent
  }

  return !isTypeAssertionExpression(parent) || parent.expression !== current
}

function isForbiddenAssertionChain(node: Assertion) {
  let assertionCount = 0
  let hasNonConstAssertion = false
  let current: ESTree.Node = node

  while (isTypeAssertionExpression(current)) {
    assertionCount += 1
    hasNonConstAssertion ||= !isConstAssertion(current)
    current = unwrapParenthesizedExpression(current.expression)
  }

  return assertionCount > 1 && hasNonConstAssertion
}

/** Disallow nested TypeScript type assertions, while permitting chains made only of const assertions. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow chained TypeScript as and angle-bracket assertions, including parenthesized chains.',
    },
    messages: {
      chained:
        'This assertion chain discards type evidence. Keep the original precise type, or parse untrusted input at its boundary before narrowing it.',
    },
  },
  createOnce(context) {
    const checkTypeAssertion = (node: Assertion) => {
      if (!isOutermostAssertionInChain(node) || !isForbiddenAssertionChain(node)) return
      context.report({ node, messageId: 'chained' })
    }

    return {
      TSAsExpression: checkTypeAssertion,
      TSTypeAssertion: checkTypeAssertion,
    }
  },
})
