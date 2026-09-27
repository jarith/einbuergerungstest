/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

import type { TypeAliasEnvironment } from '../anti-slop/shared/type-alias-resolution.ts'
import {
  createTypeAliasEnvironment,
  resolvedTypeMatches,
} from '../anti-slop/shared/type-alias-resolution.ts'

/** Ban named aliases that merely conceal TypeScript's unknown top type. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow type aliases whose resolved type is unknown; unknown must remain visible at an allowed boundary.',
    },
    messages: {
      unknownAlias:
        'Type alias `{{alias}}` hides `unknown`. Keep `unknown` explicit at the parsing boundary or on an allowed `cause` field; otherwise use the parsed owner type.',
    },
  },
  createOnce(context) {
    const state: { environment: TypeAliasEnvironment | null } = { environment: null }

    const resolvesToUnknown = (type: ESTree.TSType) =>
      state.environment !== null &&
      resolvedTypeMatches(type, state.environment, (resolved, matches) => {
        if (resolved.type === 'TSUnknownKeyword') return true
        if (resolved.type === 'TSParenthesizedType') {
          return matches(resolved.typeAnnotation)
        }
        return resolved.type === 'TSUnionType' && resolved.types.some(matches)
      })

    return {
      Program(node) {
        state.environment = createTypeAliasEnvironment(node, context.sourceCode.visitorKeys)
      },
      TSTypeAliasDeclaration(node) {
        if (!resolvesToUnknown(node.typeAnnotation)) return
        context.report({
          node: node.id,
          messageId: 'unknownAlias',
          data: { alias: node.id.name },
        })
      },
    }
  },
})
