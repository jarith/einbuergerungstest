/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode, Scope } from '@oxlint/plugins'

/** Resolve an identifier to its binding by walking lexical scopes upward. */
export const resolveVariable = (
  sourceCode: SourceCode,
  identifier: Extract<ESTree.Node, { type: 'Identifier' }>,
) => {
  for (
    let scope: Scope | null = sourceCode.getScope(identifier);
    scope !== null;
    scope = scope.upper
  ) {
    const variable = scope.set.get(identifier.name)
    if (variable !== undefined) return variable
  }
  return null
}
