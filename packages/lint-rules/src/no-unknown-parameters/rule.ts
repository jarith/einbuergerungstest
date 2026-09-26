/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

import {
  containsUnknownType,
  functionParameterBindingName,
  functionParameterTypeAnnotation,
} from '../anti-slop/shared/function-parameters.ts'

function isTypePredicateSubject(
  owner: Extract<ESTree.Node, { params: ESTree.ParamPattern[] }>,
  parameterName: string,
) {
  const predicate = owner.returnType?.typeAnnotation
  return (
    predicate?.type === 'TSTypePredicate' &&
    predicate.parameterName.type === 'Identifier' &&
    predicate.parameterName.name === parameterName
  )
}

/** Disallow unknown inputs except explicitly named error-cause enrichment. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow explicitly unknown function parameters except `cause` and type-predicate subjects; decode unknown input at its I/O boundary instead.',
    },
    messages: {
      unknownParameter:
        'Parameter `{{parameter}}` leaves input unparsed. Accept a named domain type; run the expected schema or parser at the I/O boundary before calling this function.',
    },
  },
  createOnce(context) {
    const checkParameters = (node: Extract<ESTree.Node, { params: ESTree.ParamPattern[] }>) => {
      for (const parameter of node.params) {
        const annotation = functionParameterTypeAnnotation(parameter)
        if (annotation === null || annotation === undefined) continue
        if (!containsUnknownType(annotation.typeAnnotation)) continue
        const name = functionParameterBindingName(parameter, context.sourceCode)
        if (name === 'cause' || isTypePredicateSubject(node, name)) continue
        context.report({
          node: annotation.typeAnnotation,
          messageId: 'unknownParameter',
          data: { parameter: name },
        })
      }
    }

    return {
      ArrowFunctionExpression: checkParameters,
      FunctionDeclaration: checkParameters,
      FunctionExpression: checkParameters,
      TSCallSignatureDeclaration: checkParameters,
      TSConstructSignatureDeclaration: checkParameters,
      TSConstructorType: checkParameters,
      TSDeclareFunction: checkParameters,
      TSEmptyBodyFunctionExpression: checkParameters,
      TSFunctionType: checkParameters,
      TSMethodSignature: checkParameters,
    }
  },
})
