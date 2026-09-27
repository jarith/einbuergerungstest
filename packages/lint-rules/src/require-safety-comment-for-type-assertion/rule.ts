/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

type Assertion = ESTree.TSAsExpression | ESTree.TSTypeAssertion

const DEFAULT_SAFETY_MARKERS = ['SAFETY']

const commentOwnerKinds = new Set([
  'ExpressionStatement',
  'PropertyDefinition',
  'ReturnStatement',
  'ThrowStatement',
  'VariableDeclaration',
])

const isConstAssertion = (node: Assertion) => {
  return (
    node.typeAnnotation.type === 'TSTypeReference' &&
    node.typeAnnotation.typeName.type === 'Identifier' &&
    node.typeAnnotation.typeName.name === 'const'
  )
}

const configuredSafetyMarkers = (option: unknown) => {
  if (typeof option !== 'object' || option === null || !('markers' in option)) {
    return DEFAULT_SAFETY_MARKERS
  }
  const configured = option.markers
  if (!Array.isArray(configured)) return DEFAULT_SAFETY_MARKERS
  const markers = configured.flatMap((marker) =>
    typeof marker === 'string' && marker.trim().length > 0 ? [marker.trim()] : [],
  )
  return markers.length > 0 ? markers : DEFAULT_SAFETY_MARKERS
}

const markerPattern = (markers: string[]) => {
  const alternation = markers
    .map((marker) => marker.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`))
    .join('|')
  return new RegExp(String.raw`(?:^|[^\p{L}\p{N}_])(?:${alternation})\s*:\s*\S`, 'u')
}

const hasSafetyJustificationBefore = (
  sourceCode: SourceCode,
  owner: ESTree.Node,
  assertion: Assertion,
  pattern: RegExp,
) => {
  return sourceCode
    .getCommentsBefore(owner)
    .some((comment) => comment.end <= assertion.start && pattern.test(comment.value))
}

const hasSafetyComment = (sourceCode: SourceCode, node: Assertion, pattern: RegExp): boolean => {
  for (let current: ESTree.Node = node; ;) {
    if (hasSafetyJustificationBefore(sourceCode, current, node, pattern)) return true
    if (commentOwnerKinds.has(current.type)) {
      const exportDeclaration = current.parent
      return (
        exportDeclaration?.type === 'ExportNamedDeclaration' &&
        exportDeclaration.declaration === current &&
        hasSafetyJustificationBefore(sourceCode, exportDeclaration, node, pattern)
      )
    }
    if (current.parent === null || current.parent.type === 'Program') return false
    current = current.parent
  }
}

/** Require every non-const type assertion to state the invariant TypeScript cannot express. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a nearby SAFETY comment for every TypeScript type assertion except const assertions.',
    },
    messages: {
      missingSafetyComment:
        'This type assertion has no `{{marker}}:` justification. State the checked invariant immediately before the assertion or its containing statement.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          markers: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ markers: ['SAFETY'] }],
  },
  createOnce(context) {
    const patterns = new Map<string, RegExp>()

    const checkAssertion = (node: Assertion) => {
      if (isConstAssertion(node)) return
      const markers = configuredSafetyMarkers(context.options?.[0])
      const patternKey = markers.join('\u0000')
      const pattern = patterns.get(patternKey) ?? markerPattern(markers)
      patterns.set(patternKey, pattern)
      if (hasSafetyComment(context.sourceCode, node, pattern)) return
      context.report({
        node,
        messageId: 'missingSafetyComment',
        data: { marker: markers[0] ?? DEFAULT_SAFETY_MARKERS[0] },
      })
    }

    return {
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    }
  },
})
