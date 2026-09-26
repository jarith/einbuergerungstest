import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const JSX_TYPES = new Set(['JSXElement', 'JSXFragment'])

const containsJSXInOperands = (node: ESTree.Node): boolean => {
  const { type } = node

  if (type === 'ParenthesizedExpression') {
    return containsJSX(node.expression)
  }

  if (type === 'ConditionalExpression') {
    return containsJSX(node.consequent) || containsJSX(node.alternate)
  }

  if (type === 'LogicalExpression') {
    return containsJSX(node.left) || containsJSX(node.right)
  }

  return false
}

const containsJSX = (node: ESTree.Node | null | undefined): boolean =>
  node !== null && node !== undefined && (JSX_TYPES.has(node.type) || containsJSXInOperands(node))

const skipParens = (node: ESTree.Node) => {
  for (let current = node; current.parent; current = current.parent) {
    if (current.parent.type !== 'ParenthesizedExpression') {
      return current
    }
  }

  return node
}

const FUNCTION_LIKE = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
])

const findEnclosingFunction = (node: ESTree.Node) => {
  for (let current = node; current.parent; current = current.parent) {
    if (FUNCTION_LIKE.has(current.parent.type)) {
      return current.parent
    }
  }

  return null
}

const isInsideJSXExpression = (fnNode: ESTree.Node) =>
  fnNode.parent?.type === 'JSXExpressionContainer'

const isComponentReturn = (node: ESTree.Node) => {
  const current = skipParens(node)
  const { parent } = current

  if (!parent) {
    return false
  }

  if (parent.type === 'ArrowFunctionExpression' && parent.body === current) {
    return !isInsideJSXExpression(parent)
  }

  if (parent.type === 'ReturnStatement' && parent.argument === current) {
    const fn = findEnclosingFunction(parent)

    return fn !== null && !isInsideJSXExpression(fn)
  }

  return false
}

const MESSAGE =
  'Conditional JSX return is not allowed. Use explicit if statements with early returns instead.'

export const rule = defineRule({
  create(context) {
    const check = (node: ESTree.Node) => {
      if (containsJSX(node) && isComponentReturn(node)) {
        context.report({ node, message: MESSAGE })
      }
    }

    return {
      ConditionalExpression: check,
      LogicalExpression: check,
    }
  },
})
