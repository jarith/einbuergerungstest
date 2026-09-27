/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

import { resolveVariable } from '../anti-slop/shared/scope.ts'

const moduleMockMethods = new Set(['doMock', 'mock', 'unstable_mockModule'])

const importedName = (node: ESTree.Node) => {
  if (node.type !== 'ImportSpecifier') return null
  return node.imported.type === 'Identifier' ? node.imported.name : node.imported.value
}

const isTestFrameworkObject = (sourceCode: SourceCode, expression: ESTree.Node) => {
  if (expression.type !== 'Identifier') return false
  if (
    (expression.name === 'vi' || expression.name === 'jest') &&
    sourceCode.isGlobalReference(expression)
  ) {
    return true
  }

  const variable = resolveVariable(sourceCode, expression)
  if (variable === null || variable.defs.length === 0) {
    return expression.name === 'vi' || expression.name === 'jest'
  }
  return variable.defs.some((definition) => {
    if (definition.type !== 'ImportBinding' || definition.parent?.type !== 'ImportDeclaration') {
      return false
    }
    const source = definition.parent.source.value
    const name = importedName(definition.node)
    return (source === 'vitest' && name === 'vi') || (source === '@jest/globals' && name === 'jest')
  })
}

const moduleMockCall = (sourceCode: SourceCode, callee: ESTree.Node) => {
  if (!('property' in callee) || !('object' in callee) || !('computed' in callee)) return false
  if (!isTestFrameworkObject(sourceCode, callee.object)) return false
  const property = callee.property
  const method = callee.computed
    ? property.type === 'Literal' &&
      (property.value === 'doMock' ||
        property.value === 'mock' ||
        property.value === 'unstable_mockModule')
      ? property.value
      : null
    : property.type === 'Identifier'
      ? property.name
      : null
  return method !== null && moduleMockMethods.has(method)
}

/** Ban test framework module mocking in favor of real dependency seams. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Vitest and Jest module mocking; tests must replace dependencies through real interfaces.',
    },
    messages: {
      moduleMock:
        'Replace module mocking with dependency injection through a real interface, service layer, or faithful test implementation.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return
        if (moduleMockCall(context.sourceCode, node.callee)) {
          context.report({ node, messageId: 'moduleMock' })
        }
      },
    }
  },
})
