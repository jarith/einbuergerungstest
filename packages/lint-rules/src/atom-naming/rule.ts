import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const ATOM_FACTORIES = new Set([
  'atom',
  'computed',
  'reatomArray',
  'reatomBoolean',
  'reatomClassName',
  'reatomEnum',
  'reatomField',
  'reatomFieldSet',
  'reatomForm',
  'reatomLens',
  'reatomLinkedList',
  'reatomMap',
  'reatomMediaQuery',
  'reatomNumber',
  'reatomObservable',
  'reatomRecord',
  'reatomSet',
  'reatomString',
])

export const rule = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !ATOM_FACTORIES.has(node.callee.name)) {
          return
        }

        for (let current: ESTree.Node = node; current.parent; current = current.parent) {
          if (
            current.parent.type === 'VariableDeclarator' &&
            current.parent.id.type === 'Identifier'
          ) {
            if (!current.parent.id.name.endsWith('Atom')) {
              context.report({
                node: current.parent.id,
                message: `Atom "${current.parent.id.name}" must have an "Atom" suffix.`,
              })
            }

            return
          }
        }
      },
    }
  },
})
