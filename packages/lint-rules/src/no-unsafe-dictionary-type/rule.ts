/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

import type { TypeEnvironment } from '../anti-slop/shared/dictionary-types.ts'
import {
  classifyUnsafeDictionary,
  classifyUnsafeDictionaryValue,
  createTypeEnvironment,
} from '../anti-slop/shared/dictionary-types.ts'
import { visibleTypeAlias } from '../anti-slop/shared/type-alias-resolution.ts'

const typeNodeKinds = new Set([
  'JSDocNonNullableType',
  'JSDocNullableType',
  'JSDocUnknownType',
  'TSAnyKeyword',
  'TSArrayType',
  'TSBigIntKeyword',
  'TSBooleanKeyword',
  'TSConditionalType',
  'TSConstructorType',
  'TSFunctionType',
  'TSImportType',
  'TSIndexedAccessType',
  'TSInferType',
  'TSIntersectionType',
  'TSIntrinsicKeyword',
  'TSLiteralType',
  'TSMappedType',
  'TSNamedTupleMember',
  'TSNeverKeyword',
  'TSNullKeyword',
  'TSNumberKeyword',
  'TSObjectKeyword',
  'TSParenthesizedType',
  'TSStringKeyword',
  'TSSymbolKeyword',
  'TSTemplateLiteralType',
  'TSThisType',
  'TSTupleType',
  'TSTypeLiteral',
  'TSTypeOperator',
  'TSTypePredicate',
  'TSTypeQuery',
  'TSTypeReference',
  'TSUndefinedKeyword',
  'TSUnionType',
  'TSUnknownKeyword',
  'TSVoidKeyword',
])

function isTypeNode(node: ESTree.Node): node is ESTree.TSType {
  return typeNodeKinds.has(node.type)
}

function typeReferenceName(type: ESTree.TSTypeReference) {
  return type.typeName.type === 'Identifier' ? type.typeName.name : null
}

function isInsideTypeAliasDeclaration(node: ESTree.Node) {
  let current = node.parent
  while (current !== null && current.type !== 'Program') {
    if (current.type === 'TSTypeAliasDeclaration') return true
    current = current.parent
  }
  return false
}

function isPlainAliasConsumerUse(node: ESTree.TSType, environment: TypeEnvironment) {
  if (node.type !== 'TSTypeReference' || node.typeArguments?.params.length) return false
  const name = typeReferenceName(node)
  return (
    name !== null &&
    visibleTypeAlias(name, node, environment.typeAliases) !== null &&
    !isInsideTypeAliasDeclaration(node)
  )
}

function isInsideTypeParameterConstraint(node: ESTree.Node) {
  let child = node
  let parent = child.parent
  while (parent !== null && parent.type !== 'Program') {
    if (parent.type === 'TSTypeParameter' && parent.constraint === child) return true
    child = parent
    parent = child.parent
  }
  return false
}

function shouldReportType(node: ESTree.TSType, environment: TypeEnvironment) {
  if (isInsideTypeParameterConstraint(node)) return false
  if (isPlainAliasConsumerUse(node, environment)) return false
  if (classifyUnsafeDictionary(node, environment) === null) return false
  let current = node.parent
  while (current !== null && current.type !== 'Program') {
    if (isTypeNode(current) && classifyUnsafeDictionary(current, environment) !== null) return false
    current = current.parent
  }
  return true
}

/** Disallow object-dictionary contracts whose direct value type is an unsafe escape hatch. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow object-dictionary contracts whose direct value type is unknown, any, object, {}, or a union/alias containing one of those escape hatches.',
    },
    messages: {
      unsafeDictionary:
        "This dictionary's {{value}} value type gives callers no concrete value contract. Use an owner/schema-derived value type; parse external payloads before insertion.",
    },
  },
  createOnce(context) {
    let environment: TypeEnvironment | null = null
    const report = (node: ESTree.Node, value: string) => {
      context.report({ node, messageId: 'unsafeDictionary', data: { value } })
    }
    const reportIfUnsafe = (node: ESTree.TSType) => {
      if (environment === null || !shouldReportType(node, environment)) return
      const unsafe = classifyUnsafeDictionary(node, environment)
      if (unsafe === null) return
      report(node, unsafe.unsafeValue)
    }

    return {
      Program(node) {
        environment = createTypeEnvironment(node, context.sourceCode.visitorKeys)
      },
      TSTypeReference: reportIfUnsafe,
      TSTypeLiteral: reportIfUnsafe,
      TSMappedType: reportIfUnsafe,
      TSIndexSignature(node) {
        if (
          environment === null ||
          node.typeAnnotation === null ||
          node.parent.type === 'TSTypeLiteral'
        )
          return
        const unsafe = classifyUnsafeDictionaryValue(
          node.typeAnnotation.typeAnnotation,
          environment,
        )
        if (unsafe !== null) report(node, unsafe.unsafeValue)
      },
    }
  },
})
