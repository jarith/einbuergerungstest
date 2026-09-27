/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree, SourceCode } from '@oxlint/plugins'

import { lexicalTypeParameterNames } from './lexical-type-parameters.ts'

type TypeBinding = Readonly<{
  alias: ESTree.TSTypeAliasDeclaration | null
  name: string
  scope: ESTree.Node
}>

export type TypeAliasEnvironment = Readonly<{
  aliases: ESTree.TSTypeAliasDeclaration[]
  bindingsByName: Map<string, TypeBinding[]>
  visitorKeys: SourceCode['visitorKeys']
}>

type TypeSubstitution = Readonly<{
  type: ESTree.TSType
  substitutions: Map<string, TypeSubstitution>
}>

type TypeMatcher = (type: ESTree.TSType, matches: (type: ESTree.TSType) => boolean) => boolean

const environmentsByProgram = new WeakMap<ESTree.Program, TypeAliasEnvironment>()

const isNode = (value: unknown): value is ESTree.Node => {
  return (
    typeof value === 'object' && value !== null && 'type' in value && typeof value.type === 'string'
  )
}

const enclosingTypeScope = (node: ESTree.Node) => {
  for (let current: ESTree.Node | null = node.parent; current !== null; current = current.parent) {
    if (
      current.type === 'Program' ||
      current.type === 'BlockStatement' ||
      current.type === 'TSModuleBlock' ||
      current.type === 'StaticBlock' ||
      current.type === 'SwitchStatement'
    ) {
      return current
    }
  }
  return node
}

const declaredTypeBinding = (node: ESTree.Node) => {
  if (node.type === 'TSTypeAliasDeclaration') {
    return { alias: node, name: node.id.name }
  }
  if (
    node.type === 'TSInterfaceDeclaration' ||
    node.type === 'TSEnumDeclaration' ||
    node.type === 'ClassDeclaration' ||
    node.type === 'ClassExpression'
  ) {
    return node.id === null ? null : { alias: null, name: node.id.name }
  }
  if (
    node.type === 'ImportSpecifier' ||
    node.type === 'ImportDefaultSpecifier' ||
    node.type === 'ImportNamespaceSpecifier'
  ) {
    return { alias: null, name: node.local.name }
  }
  return null
}

const collectTypeBindings = (
  node: ESTree.Node,
  visitorKeys: SourceCode['visitorKeys'],
  bindingsByName: Map<string, TypeBinding[]>,
  aliases: ESTree.TSTypeAliasDeclaration[],
): void => {
  const declared = declaredTypeBinding(node)
  if (declared !== null) {
    const bindings = bindingsByName.get(declared.name) ?? []
    bindings.push({ ...declared, scope: enclosingTypeScope(node) })
    bindingsByName.set(declared.name, bindings)
    if (declared.alias !== null) aliases.push(declared.alias)
  }

  // SAFETY: Oxlint's visitor keys identify only ESTree child-node properties.
  const fields = node as ESTree.Node & Record<string, unknown>
  for (const key of visitorKeys[node.type] ?? []) {
    const value = fields[key]
    if (isNode(value)) {
      collectTypeBindings(value, visitorKeys, bindingsByName, aliases)
      continue
    }
    if (!Array.isArray(value)) continue
    for (const child of value) {
      if (isNode(child)) {
        collectTypeBindings(child, visitorKeys, bindingsByName, aliases)
      }
    }
  }
}

/** Collect every lexical type alias and competing type binding in a program. */
export const createTypeAliasEnvironment = (
  program: ESTree.Program,
  visitorKeys: SourceCode['visitorKeys'],
): TypeAliasEnvironment => {
  const cached = environmentsByProgram.get(program)
  if (cached !== undefined) return cached
  const bindingsByName = new Map<string, TypeBinding[]>()
  const aliases: ESTree.TSTypeAliasDeclaration[] = []
  collectTypeBindings(program, visitorKeys, bindingsByName, aliases)
  const environment = { aliases, bindingsByName, visitorKeys }
  environmentsByProgram.set(program, environment)
  return environment
}

const ancestorDistance = (ancestor: ESTree.Node, node: ESTree.Node) => {
  for (
    let current: ESTree.Node | null = node, distance = 0;
    current !== null;
    current = current.parent, distance += 1
  ) {
    if (current === ancestor) return distance
  }
  return null
}

const nearestTypeBindings = (name: string, use: ESTree.Node, environment: TypeAliasEnvironment) => {
  const candidates = environment.bindingsByName.get(name) ?? []
  const nearest: { distance: number; bindings: TypeBinding[] } = {
    distance: Number.POSITIVE_INFINITY,
    bindings: [],
  }
  for (const candidate of candidates) {
    const distance = ancestorDistance(candidate.scope, use)
    if (distance === null || distance > nearest.distance) continue
    if (distance === nearest.distance) {
      nearest.bindings.push(candidate)
      continue
    }
    nearest.distance = distance
    nearest.bindings = [candidate]
  }
  return nearest.bindings
}

/** Resolve the nearest visible alias with this name, respecting lexical shadowing. */
export const visibleTypeAlias = (
  name: string,
  use: ESTree.Node,
  environment: TypeAliasEnvironment,
) => {
  if (lexicalTypeParameterNames(use, environment.visitorKeys).has(name)) return null
  const bindings = nearestTypeBindings(name, use, environment)
  return bindings.length === 1 ? (bindings[0]?.alias ?? null) : null
}

/** Return whether a local declaration shadows a built-in type at this use. */
export const hasVisibleTypeBinding = (
  name: string,
  use: ESTree.Node,
  environment: TypeAliasEnvironment,
) => {
  return (
    lexicalTypeParameterNames(use, environment.visitorKeys).has(name) ||
    nearestTypeBindings(name, use, environment).length > 0
  )
}

const typeReferenceName = (type: ESTree.TSTypeReference) => {
  return type.typeName.type === 'Identifier' ? type.typeName.name : null
}

const aliasSubstitutions = (
  alias: ESTree.TSTypeAliasDeclaration,
  reference: ESTree.TSTypeReference,
  base: Map<string, TypeSubstitution>,
) => {
  const parameters = alias.typeParameters?.params ?? []
  const arguments_ = reference.typeArguments?.params ?? []
  const next = new Map(base)
  for (const [index, parameter] of parameters.entries()) {
    const explicitArgument = arguments_[index]
    const argument = explicitArgument ?? parameter.default
    if (argument === null || argument === undefined) return null
    const argumentSubstitutions = explicitArgument === undefined ? next : base
    next.set(parameter.name.name, {
      type: argument,
      substitutions: new Map(argumentSubstitutions),
    })
  }
  return next
}

/** Match a type after resolving visible aliases and substituting their type parameters. */
export const resolvedTypeMatches = (
  type: ESTree.TSType,
  environment: TypeAliasEnvironment,
  matcher: TypeMatcher,
): boolean => {
  const evaluate = (
    current: ESTree.TSType,
    substitutions: Map<string, TypeSubstitution>,
    resolvingAliases: Set<ESTree.TSTypeAliasDeclaration>,
  ): boolean => {
    if (current.type === 'TSTypeReference') {
      const name = typeReferenceName(current)
      if (name !== null) {
        const substitution = substitutions.get(name)
        if (substitution !== undefined && !current.typeArguments?.params.length) {
          return evaluate(substitution.type, substitution.substitutions, resolvingAliases)
        }
        const alias = visibleTypeAlias(name, current, environment)
        if (alias !== null && !resolvingAliases.has(alias)) {
          const nextSubstitutions = aliasSubstitutions(alias, current, substitutions)
          if (nextSubstitutions !== null) {
            const nextResolving = new Set(resolvingAliases)
            nextResolving.add(alias)
            return evaluate(alias.typeAnnotation, nextSubstitutions, nextResolving)
          }
        }
      }
    }
    return matcher(current, (child) => evaluate(child, substitutions, resolvingAliases))
  }

  return evaluate(type, new Map(), new Set())
}
