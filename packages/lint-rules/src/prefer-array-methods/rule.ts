import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const LOOP_TYPES = new Set(['ForStatement', 'ForOfStatement', 'ForInStatement'])

const FUNCTION_BOUNDARIES = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
])

const MUTATION_METHODS = new Set(['push', 'unshift', 'set', 'add'])

const MESSAGE =
  'Prefer declarative methods (.map(), .filter(), .reduce(), Object.fromEntries(), etc.) over imperative loop with collection mutation.'

const findEnclosingLoop = (node: ESTree.Node): ESTree.Node | null => {
  const { parent } = node

  if (!parent) {
    return null
  }

  if (FUNCTION_BOUNDARIES.has(parent.type)) {
    return null
  }

  if (LOOP_TYPES.has(parent.type)) {
    return parent
  }

  return findEnclosingLoop(parent)
}

const isEmptyCollectionInit = (initNode: ESTree.Node | null) => {
  if (!initNode) {
    return false
  }

  if (initNode.type === 'ArrayExpression' && initNode.elements.length === 0) {
    return true
  }

  if (initNode.type === 'ObjectExpression' && initNode.properties.length === 0) {
    return true
  }

  return (
    initNode.type === 'NewExpression' &&
    initNode.callee.type === 'Identifier' &&
    (initNode.callee.name === 'Map' || initNode.callee.name === 'Set') &&
    initNode.arguments.length === 0
  )
}

const hasMatchingDeclarator = (sibling: ESTree.VariableDeclaration, targetName: string) =>
  sibling.declarations.some(
    (declarator) =>
      declarator.id.type === 'Identifier' &&
      declarator.id.name === targetName &&
      isEmptyCollectionInit(declarator.init),
  )

const findEmptyCollectionDecl = (loopNode: ESTree.Node, targetName: string) => {
  const { parent } = loopNode
  const siblings = parent !== null && 'body' in parent ? parent.body : null

  if (!Array.isArray(siblings)) {
    return false
  }

  const siblingNodes: readonly ESTree.Node[] = siblings
  const loopIndex = siblingNodes.indexOf(loopNode)

  return siblings
    .slice(0, loopIndex)
    .some(
      (sibling) =>
        sibling.type === 'VariableDeclaration' && hasMatchingDeclarator(sibling, targetName),
    )
}

export const rule = defineRule({
  create(context) {
    const reportedLoops = new Set<ESTree.Node>()

    const handleMutation = (targetName: string, node: ESTree.Node) => {
      const loopNode = findEnclosingLoop(node)

      if (!loopNode || reportedLoops.has(loopNode)) {
        return
      }

      if (findEmptyCollectionDecl(loopNode, targetName)) {
        reportedLoops.add(loopNode)

        context.report({ node: loopNode, message: MESSAGE })
      }
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          !MUTATION_METHODS.has(node.callee.property.name) ||
          node.callee.object.type !== 'Identifier'
        ) {
          return
        }

        handleMutation(node.callee.object.name, node)
      },

      AssignmentExpression(node) {
        if (node.left.type !== 'MemberExpression' || node.left.object.type !== 'Identifier') {
          return
        }

        handleMutation(node.left.object.name, node)
      },
    }
  },
})
