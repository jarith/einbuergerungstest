/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode } from '@oxlint/plugins'

import { resolveVariable } from './scope.ts'

function isGlobalReflect(sourceCode: SourceCode, expression: ESTree.Node) {
  if (expression.type !== 'Identifier' || expression.name !== 'Reflect') return false
  if (sourceCode.isGlobalReference(expression)) return true
  const variable = resolveVariable(sourceCode, expression)
  return variable === null || variable.defs.length === 0
}

/** Reports whether a call target names one method on the global Reflect object. */
export function isGlobalReflectMethodCall(
  sourceCode: SourceCode,
  callee: ESTree.Node,
  methodName: string,
) {
  if (!('property' in callee) || !('object' in callee) || !('computed' in callee)) return false
  if (!isGlobalReflect(sourceCode, callee.object)) return false
  const property = callee.property
  return callee.computed
    ? property.type === 'Literal' && property.value === methodName
    : property.type === 'Identifier' && property.name === methodName
}
