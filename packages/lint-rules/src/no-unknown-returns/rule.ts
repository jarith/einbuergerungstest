/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

import type { TypeAliasEnvironment } from '../anti-slop/shared/type-alias-resolution.ts'
import {
  createTypeAliasEnvironment,
  resolvedTypeMatches,
} from '../anti-slop/shared/type-alias-resolution.ts'

/** Ban function contracts that return unknown instead of a parsed domain type. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow functions whose explicit return contract is unknown or Promise<unknown>.',
    },
    messages: {
      unknownReturn:
        'This function exposes `unknown` to its caller. Parse the value at its boundary and return a named domain type.',
    },
  },
  createOnce(context) {
    let environment: TypeAliasEnvironment | null = null

    const resolvesToUnknown = (type: ESTree.TSType) =>
      environment !== null &&
      resolvedTypeMatches(type, environment, (resolved, matches) => {
        if (resolved.type === 'TSUnknownKeyword') return true
        if (resolved.type === 'TSParenthesizedType') {
          return matches(resolved.typeAnnotation)
        }
        if (resolved.type === 'TSUnionType') return resolved.types.some(matches)
        if (
          resolved.type !== 'TSTypeReference' ||
          resolved.typeName.type !== 'Identifier' ||
          (resolved.typeName.name !== 'Promise' && resolved.typeName.name !== 'PromiseLike')
        ) {
          return false
        }
        const value = resolved.typeArguments?.params[0]
        return value !== undefined && matches(value)
      })

    const checkReturnType = (node: Extract<ESTree.Node, { params: ESTree.ParamPattern[] }>) => {
      const annotation = node.returnType
      if (annotation === null || annotation === undefined) return
      if (!resolvesToUnknown(annotation.typeAnnotation)) return
      context.report({ node: annotation.typeAnnotation, messageId: 'unknownReturn' })
    }

    return {
      Program(node) {
        environment = createTypeAliasEnvironment(node, context.sourceCode.visitorKeys)
      },
      ArrowFunctionExpression: checkReturnType,
      FunctionDeclaration: checkReturnType,
      FunctionExpression: checkReturnType,
      TSCallSignatureDeclaration: checkReturnType,
      TSConstructSignatureDeclaration: checkReturnType,
      TSConstructorType: checkReturnType,
      TSDeclareFunction: checkReturnType,
      TSEmptyBodyFunctionExpression: checkReturnType,
      TSFunctionType: checkReturnType,
      TSMethodSignature: checkReturnType,
    }
  },
})
