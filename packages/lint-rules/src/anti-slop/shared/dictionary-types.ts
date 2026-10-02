/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode } from '@oxlint/plugins'

import type { TypeAliasEnvironment } from './type-alias-resolution.ts'
import {
  createTypeAliasEnvironment,
  hasVisibleTypeBinding,
  visibleTypeAlias,
} from './type-alias-resolution.ts'

export type TypeEnvironment = Readonly<{
  interfaces: Map<string, ESTree.TSInterfaceDeclaration[]>
  typeAliases: TypeAliasEnvironment
}>

export type WideningTarget = Readonly<{
  kind: 'unknown' | 'object' | 'open dictionary' | 'anonymous object' | 'generic container'
}>

type UnsafeValue = 'unknown' | 'any' | 'object' | 'empty-object' | 'union'

type DictionaryValue = Readonly<{ type: ESTree.TSType; substitutions: Map<string, ESTree.TSType> }>

const BUILT_INS = new Set([
  'Record',
  'Readonly',
  'Partial',
  'Required',
  'Pick',
  'Omit',
  'PropertyKey',
  'NonNullable',
])
const TRANSPARENT_WRAPPERS = new Set(['Readonly', 'Partial', 'Required', 'NonNullable'])

const declaredStatement = (statement: ESTree.Program['body'][number]) => {
  return statement.type === 'ExportNamedDeclaration' ||
    statement.type === 'ExportDefaultDeclaration'
    ? (statement.declaration ?? null)
    : statement
}

export const createTypeEnvironment = (
  program: ESTree.Program,
  visitorKeys: SourceCode['visitorKeys'],
): TypeEnvironment => {
  const interfaces = new Map<string, ESTree.TSInterfaceDeclaration[]>()

  for (const statement of program.body) {
    const declaration = declaredStatement(statement)
    if (declaration?.type !== 'TSInterfaceDeclaration') continue
    const declarations = interfaces.get(declaration.id.name) ?? []
    declarations.push(declaration)
    interfaces.set(declaration.id.name, declarations)
  }

  return {
    interfaces,
    typeAliases: createTypeAliasEnvironment(program, visitorKeys),
  }
}

const typeReferenceName = (type: ESTree.TSTypeReference) => {
  return type.typeName.type === 'Identifier' ? type.typeName.name : null
}

const isBuiltIn = (name: string, use: ESTree.Node, environment: TypeEnvironment) => {
  return BUILT_INS.has(name) && !hasVisibleTypeBinding(name, use, environment.typeAliases)
}

const isUnappliedReferenceTo = (type: ESTree.TSType, name: string) => {
  const unwrapped = unwrapTransparentType(type)
  return (
    unwrapped.type === 'TSTypeReference' &&
    typeReferenceName(unwrapped) === name &&
    (unwrapped.typeArguments === null ||
      unwrapped.typeArguments === undefined ||
      unwrapped.typeArguments.params.length === 0)
  )
}

const unwrapTransparentType = (type: ESTree.TSType) => {
  for (let current = type; ;) {
    if (
      current.type !== 'TSParenthesizedType' &&
      (current.type !== 'TSTypeOperator' || current.operator !== 'readonly')
    ) {
      return current
    }
    current = current.typeAnnotation
  }
}

const isNeverType = (type: ESTree.TSType) => {
  return unwrapTransparentType(type).type === 'TSNeverKeyword'
}

const isEffectivelyEmptyMember = (member: ESTree.TSSignature) => {
  return (
    member.type === 'TSPropertySignature' &&
    member.optional === true &&
    member.typeAnnotation !== null &&
    member.typeAnnotation !== undefined &&
    isNeverType(member.typeAnnotation.typeAnnotation)
  )
}

const isEffectivelyEmptyTypeLiteral = (type: ESTree.TSTypeLiteral) => {
  return type.members.length === 0 || type.members.every(isEffectivelyEmptyMember)
}

const isEffectivelyEmptyInterface = (declarations: ESTree.TSInterfaceDeclaration[]) => {
  if (declarations.length !== 1) return false
  const [type] = declarations
  return (
    type !== undefined &&
    type.extends.length === 0 &&
    (type.body.body.length === 0 || type.body.body.every(isEffectivelyEmptyMember))
  )
}

const resolvedSubstitutionArgument = (
  type: ESTree.TSType,
  base: Map<string, ESTree.TSType>,
  resolving = new Set<string>(),
): ESTree.TSType => {
  const unwrapped = unwrapTransparentType(type)
  if (unwrapped.type !== 'TSTypeReference') return type
  const name = typeReferenceName(unwrapped)
  if (name === null || resolving.has(name)) return type
  const substitution = base.get(name)
  if (substitution === undefined) return type
  const nextResolving = new Set(resolving)
  nextResolving.add(name)
  return resolvedSubstitutionArgument(substitution, base, nextResolving)
}

const aliasSubstitution = (
  alias: ESTree.TSTypeAliasDeclaration,
  type: ESTree.TSTypeReference,
  base: Map<string, ESTree.TSType>,
) => {
  const parameters = alias.typeParameters?.params ?? []
  const arguments_ = type.typeArguments?.params ?? []
  const next = new Map(base)
  for (const [index, parameter] of parameters.entries()) {
    const argument = arguments_[index] ?? parameter.default
    if (argument === null || argument === undefined) return null
    next.set(parameter.name.name, resolvedSubstitutionArgument(argument, next))
  }
  return next
}

const unsafeDirectValue = (
  type: ESTree.TSType,
  environment: TypeEnvironment,
  substitutions: Map<string, ESTree.TSType>,
  resolvingAliases: Set<string>,
): UnsafeValue | null => {
  const unwrapped = unwrapTransparentType(type)
  if (unwrapped.type === 'TSUnknownKeyword') return 'unknown'
  if (unwrapped.type === 'TSAnyKeyword') return 'any'
  if (unwrapped.type === 'TSObjectKeyword') return 'object'
  if (unwrapped.type === 'TSTypeLiteral' && isEffectivelyEmptyTypeLiteral(unwrapped))
    return 'empty-object'
  if (unwrapped.type === 'TSUnionType') {
    return unwrapped.types.some(
      (member) => unsafeDirectValue(member, environment, substitutions, resolvingAliases) !== null,
    )
      ? 'union'
      : null
  }
  if (unwrapped.type === 'TSIntersectionType') {
    const unsafeMembers = unwrapped.types.map((member) =>
      unsafeDirectValue(member, environment, substitutions, resolvingAliases),
    )
    if (unsafeMembers.includes('any')) return 'any'
    return unsafeMembers.length > 0 && unsafeMembers.every((member) => member !== null)
      ? (unsafeMembers[0] ?? null)
      : null
  }
  if (unwrapped.type !== 'TSTypeReference') return null
  const name = typeReferenceName(unwrapped)
  if (name === null) return null
  if (TRANSPARENT_WRAPPERS.has(name) && isBuiltIn(name, unwrapped, environment)) {
    const wrapped = unwrapped.typeArguments?.params[0]
    return wrapped === undefined
      ? null
      : unsafeDirectValue(wrapped, environment, substitutions, resolvingAliases)
  }
  const substitution = substitutions.get(name)
  if (substitution !== undefined) {
    return isUnappliedReferenceTo(substitution, name)
      ? null
      : unsafeDirectValue(substitution, environment, substitutions, resolvingAliases)
  }
  const interfaceDeclarations = environment.interfaces.get(name)
  if (interfaceDeclarations !== undefined) {
    return isEffectivelyEmptyInterface(interfaceDeclarations) ? 'empty-object' : null
  }
  const alias = visibleTypeAlias(name, unwrapped, environment.typeAliases)
  if (alias === null || resolvingAliases.has(name)) return null
  const nextSubstitutions = aliasSubstitution(alias, unwrapped, substitutions)
  if (nextSubstitutions === null) return null
  const nextResolving = new Set(resolvingAliases)
  nextResolving.add(name)
  return unsafeDirectValue(alias.typeAnnotation, environment, nextSubstitutions, nextResolving)
}

const dictionaryValueTypes = (
  type: ESTree.TSType,
  environment: TypeEnvironment,
  substitutions: Map<string, ESTree.TSType>,
  resolvingAliases: Set<string>,
): DictionaryValue[] => {
  const unwrapped = unwrapTransparentType(type)

  if (unwrapped.type === 'TSTypeLiteral') {
    return unwrapped.members.flatMap((member) =>
      member.type === 'TSIndexSignature' && member.typeAnnotation !== null
        ? [{ type: member.typeAnnotation.typeAnnotation, substitutions }]
        : [],
    )
  }

  if (unwrapped.type === 'TSMappedType') {
    return unwrapped.typeAnnotation === null
      ? []
      : [{ type: unwrapped.typeAnnotation, substitutions }]
  }

  if (unwrapped.type !== 'TSTypeReference') return []
  const name = typeReferenceName(unwrapped)
  if (name === null) return []

  const substitution = substitutions.get(name)
  if (substitution !== undefined) {
    return isUnappliedReferenceTo(substitution, name)
      ? []
      : dictionaryValueTypes(substitution, environment, substitutions, resolvingAliases)
  }

  if (TRANSPARENT_WRAPPERS.has(name) && isBuiltIn(name, unwrapped, environment)) {
    const wrapped = unwrapped.typeArguments?.params[0]
    return wrapped === undefined
      ? []
      : dictionaryValueTypes(wrapped, environment, substitutions, resolvingAliases)
  }

  if (name === 'Record' && isBuiltIn(name, unwrapped, environment)) {
    const value = unwrapped.typeArguments?.params[1] ?? null
    return value === null ? [] : [{ type: value, substitutions }]
  }

  if ((name === 'Pick' || name === 'Omit') && isBuiltIn(name, unwrapped, environment)) {
    const source = unwrapped.typeArguments?.params[0]
    return source === undefined
      ? []
      : dictionaryValueTypes(source, environment, substitutions, resolvingAliases)
  }

  const alias = visibleTypeAlias(name, unwrapped, environment.typeAliases)
  if (alias === null || resolvingAliases.has(name)) return []
  const nextSubstitutions = aliasSubstitution(alias, unwrapped, substitutions)
  if (nextSubstitutions === null) return []
  const nextResolving = new Set(resolvingAliases)
  nextResolving.add(name)
  return dictionaryValueTypes(alias.typeAnnotation, environment, nextSubstitutions, nextResolving)
}

export const classifyUnsafeDictionaryValue = (
  valueType: ESTree.TSType,
  environment: TypeEnvironment,
) => {
  const unsafeValue = unsafeDirectValue(valueType, environment, new Map(), new Set())
  return unsafeValue === null ? null : { kind: 'unsafe-dictionary', unsafeValue }
}

export const classifyUnsafeDictionary = (type: ESTree.TSType, environment: TypeEnvironment) => {
  for (const valueType of dictionaryValueTypes(type, environment, new Map(), new Set())) {
    const unsafeValue = unsafeDirectValue(
      valueType.type,
      environment,
      valueType.substitutions,
      new Set(),
    )
    if (unsafeValue !== null) return { kind: 'unsafe-dictionary', unsafeValue }
  }
  return null
}

export const classifyWideningTarget = (
  type: ESTree.TSType,
  environment: TypeEnvironment,
): WideningTarget | null => {
  const unwrapped = unwrapTransparentType(type)
  if (unwrapped.type === 'TSUnknownKeyword') return { kind: 'unknown' }
  if (unwrapped.type === 'TSObjectKeyword') return { kind: 'object' }
  if (unwrapped.type === 'TSTypeLiteral') {
    return unwrapped.members.some((member) => member.type === 'TSIndexSignature')
      ? { kind: 'open dictionary' }
      : unwrapped.members.length > 0
        ? { kind: 'anonymous object' }
        : null
  }
  if (unwrapped.type === 'TSMappedType') return { kind: 'open dictionary' }
  if (unwrapped.type !== 'TSTypeReference') return null
  const name = typeReferenceName(unwrapped)
  if (name === null) return null
  if (TRANSPARENT_WRAPPERS.has(name) && isBuiltIn(name, unwrapped, environment)) {
    const wrapped = unwrapped.typeArguments?.params[0]
    return wrapped === undefined ? null : classifyWideningTarget(wrapped, environment)
  }
  if (name === 'Record' && isBuiltIn(name, unwrapped, environment)) {
    return hasBroadRecordKey(unwrapped, environment, new Map()) ? { kind: 'open dictionary' } : null
  }
  const alias = visibleTypeAlias(name, unwrapped, environment.typeAliases)
  if (alias === null) return null
  if ((alias.typeParameters?.params.length ?? 0) > 0) {
    const substitutions = aliasSubstitution(alias, unwrapped, new Map())
    const resolved =
      substitutions === null
        ? null
        : classifyAliasBroadTarget(
            alias.typeAnnotation,
            environment,
            substitutions,
            new Set([name]),
          )
    return resolved?.kind === 'open dictionary' ? { kind: 'generic container' } : null
  }
  const substitutions = aliasSubstitution(alias, unwrapped, new Map())
  if (substitutions === null) return null
  const resolved = classifyAliasBroadTarget(
    alias.typeAnnotation,
    environment,
    substitutions,
    new Set([name]),
  )
  return resolved
}

const hasBroadRecordKey = (
  type: ESTree.TSTypeReference,
  environment: TypeEnvironment,
  substitutions: Map<string, ESTree.TSType>,
): boolean => {
  const key = type.typeArguments?.params[0]
  return key === undefined || isBroadMappedKey(key, environment, substitutions)
}

const isBroadMappedKey = (
  type: ESTree.TSType,
  environment: TypeEnvironment,
  substitutions: Map<string, ESTree.TSType>,
  visitedAliases = new Set<string>(),
): boolean => {
  const unwrapped = unwrapTransparentType(type)
  if (
    unwrapped.type === 'TSStringKeyword' ||
    unwrapped.type === 'TSNumberKeyword' ||
    unwrapped.type === 'TSSymbolKeyword'
  ) {
    return true
  }
  if (unwrapped.type === 'TSUnionType') {
    return unwrapped.types.some((member) =>
      isBroadMappedKey(member, environment, substitutions, visitedAliases),
    )
  }
  if (unwrapped.type !== 'TSTypeReference') return false
  const name = typeReferenceName(unwrapped)
  if (name === null) return false
  const substitution = substitutions.get(name)
  if (substitution !== undefined && !isUnappliedReferenceTo(substitution, name)) {
    return isBroadMappedKey(substitution, environment, substitutions, visitedAliases)
  }
  if (name === 'PropertyKey' && isBuiltIn(name, unwrapped, environment)) return true
  const alias = visibleTypeAlias(name, unwrapped, environment.typeAliases)
  if (
    alias === null ||
    (alias.typeParameters?.params.length ?? 0) > 0 ||
    visitedAliases.has(name)
  ) {
    return false
  }
  const nextVisited = new Set(visitedAliases)
  nextVisited.add(name)
  return isBroadMappedKey(alias.typeAnnotation, environment, substitutions, nextVisited)
}

const classifyAliasBroadTarget = (
  type: ESTree.TSType,
  environment: TypeEnvironment,
  substitutions: Map<string, ESTree.TSType>,
  resolvingAliases: Set<string>,
): WideningTarget | null => {
  const unwrapped = unwrapTransparentType(type)
  if (unwrapped.type === 'TSUnknownKeyword') return { kind: 'unknown' }
  if (unwrapped.type === 'TSObjectKeyword') return { kind: 'object' }
  if (unwrapped.type === 'TSTypeLiteral') {
    return unwrapped.members.some((member) => member.type === 'TSIndexSignature')
      ? { kind: 'open dictionary' }
      : null
  }
  if (unwrapped.type === 'TSMappedType') {
    return isBroadMappedKey(unwrapped.constraint, environment, substitutions)
      ? { kind: 'open dictionary' }
      : null
  }
  if (unwrapped.type !== 'TSTypeReference') return null
  const name = typeReferenceName(unwrapped)
  if (name === null) return null
  const substitution = substitutions.get(name)
  if (substitution !== undefined) {
    return isUnappliedReferenceTo(substitution, name)
      ? null
      : classifyAliasBroadTarget(substitution, environment, substitutions, resolvingAliases)
  }
  if (TRANSPARENT_WRAPPERS.has(name) && isBuiltIn(name, unwrapped, environment)) {
    const wrapped = unwrapped.typeArguments?.params[0]
    return wrapped === undefined
      ? null
      : classifyAliasBroadTarget(wrapped, environment, substitutions, resolvingAliases)
  }
  if (name === 'Record' && isBuiltIn(name, unwrapped, environment)) {
    return hasBroadRecordKey(unwrapped, environment, substitutions)
      ? { kind: 'open dictionary' }
      : null
  }
  const alias = visibleTypeAlias(name, unwrapped, environment.typeAliases)
  if (alias === null || resolvingAliases.has(name)) return null
  const nextSubstitutions = aliasSubstitution(alias, unwrapped, substitutions)
  if (nextSubstitutions === null) return null
  const nextResolving = new Set(resolvingAliases)
  nextResolving.add(name)
  return classifyAliasBroadTarget(
    alias.typeAnnotation,
    environment,
    nextSubstitutions,
    nextResolving,
  )
}

export const isPopulatedObjectExpression = (expression: ESTree.Node) => {
  for (let current = expression; ;) {
    if (
      current.type !== 'ParenthesizedExpression' &&
      current.type !== 'TSAsExpression' &&
      current.type !== 'TSTypeAssertion' &&
      current.type !== 'TSNonNullExpression'
    ) {
      return current.type === 'ObjectExpression' && current.properties.length > 0
    }
    current = current.expression
  }
}

export const isKnownEvidenceExpression = (expression: ESTree.Node) => {
  for (let current = expression; ;) {
    if (
      current.type !== 'ParenthesizedExpression' &&
      current.type !== 'TSAsExpression' &&
      current.type !== 'TSTypeAssertion' &&
      current.type !== 'TSNonNullExpression' &&
      current.type !== 'TSSatisfiesExpression'
    ) {
      if (current.type === 'ObjectExpression') return true
      return (
        current.type === 'ArrayExpression' ||
        current.type === 'ArrowFunctionExpression' ||
        current.type === 'ClassExpression' ||
        current.type === 'FunctionExpression' ||
        current.type === 'NewExpression' ||
        current.type === 'Literal' ||
        current.type === 'TemplateLiteral' ||
        current.type === 'UnaryExpression'
      )
    }
    current = current.expression
  }
}
