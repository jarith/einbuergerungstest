import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

interface AtomScope {
  atoms: Set<string>
  reported: boolean
}

type AtomSetCall = ESTree.CallExpression & {
  callee: ESTree.MemberExpression & { object: ESTree.IdentifierReference }
}

const SCOPE_TYPES = new Set([
  'ArrowFunctionExpression',
  'FunctionExpression',
  'FunctionDeclaration',
])

const getScopeNode = (node: ESTree.Node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (SCOPE_TYPES.has(current.type)) {
      return current
    }
  }

  return null
}

const isInsideActionOrWithActions = (node: ESTree.Node) => {
  for (let current = node.parent; current; current = current.parent) {
    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'Identifier' &&
      (current.callee.name === 'action' || current.callee.name === 'withActions')
    ) {
      return true
    }
  }

  return false
}

const isAtomSetCall = (node: ESTree.CallExpression): node is AtomSetCall =>
  node.callee.type === 'MemberExpression' &&
  node.callee.property.type === 'Identifier' &&
  node.callee.property.name === 'set' &&
  node.callee.object.type === 'Identifier' &&
  node.callee.object.name.endsWith('Atom')

const getOrCreateScope = (
  scopeMap: Map<ESTree.Node | 'module', AtomScope>,
  key: ESTree.Node | 'module',
): AtomScope => {
  const existing = scopeMap.get(key)

  if (existing !== undefined) {
    return existing
  }
  const scope: AtomScope = { atoms: new Set(), reported: false }

  scopeMap.set(key, scope)

  return scope
}

export const rule = defineRule({
  create(context) {
    const scopeMap = new Map<ESTree.Node | 'module', AtomScope>()

    return {
      CallExpression(node) {
        if (!isAtomSetCall(node) || isInsideActionOrWithActions(node)) {
          return
        }

        const scopeNode = getScopeNode(node)
        const scope = getOrCreateScope(scopeMap, scopeNode ?? 'module')

        scope.atoms.add(node.callee.object.name)

        if (scope.atoms.size >= 2 && !scope.reported) {
          scope.reported = true

          context.report({
            node: scopeNode ?? node,
            message:
              'Functions that .set() 2+ distinct atoms must be wrapped in action() for batching.',
          })
        }
      },
    }
  },
})
