/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode, Scope } from '@oxlint/plugins'

/** Resolve an identifier to its binding by walking lexical scopes upward. */
export function resolveVariable(
  sourceCode: SourceCode,
  identifier: Extract<ESTree.Node, { type: 'Identifier' }>,
) {
  let scope: Scope | null = sourceCode.getScope(identifier)
  while (scope !== null) {
    const variable = scope.set.get(identifier.name)
    if (variable !== undefined) return variable
    scope = scope.upper
  }
  return null
}
