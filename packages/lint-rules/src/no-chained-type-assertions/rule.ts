/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

type Assertion = ESTree.TSAsExpression | ESTree.TSTypeAssertion

const isTypeAssertionExpression = (node: ESTree.Node | null): node is Assertion => {
  return node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion'
}

const unwrapParenthesizedExpression = (expression: ESTree.Node) => {
  for (let current = expression; ;) {
    if (current.type !== 'ParenthesizedExpression') return current
    current = current.expression
  }
}

const isConstAssertion = (node: Assertion) => {
  const { typeAnnotation } = node
  return (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'const'
  )
}

const isOutermostAssertionInChain = (node: Assertion) => {
  for (let current: ESTree.Node = node, parent = node.parent; ;) {
    if (parent?.type !== 'ParenthesizedExpression' || parent.expression !== current) {
      return !isTypeAssertionExpression(parent) || parent.expression !== current
    }
    current = parent
    parent = parent.parent
  }
}

const isForbiddenAssertionChain = (node: Assertion) => {
  if (!isTypeAssertionExpression(unwrapParenthesizedExpression(node.expression))) return false
  for (let current: ESTree.Node = node; isTypeAssertionExpression(current);) {
    if (!isConstAssertion(current)) return true
    current = unwrapParenthesizedExpression(current.expression)
  }
  return false
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
