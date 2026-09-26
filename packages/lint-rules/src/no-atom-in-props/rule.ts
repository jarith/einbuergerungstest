import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const FORBIDDEN_TYPES = new Set(['Atom', 'AtomMut', 'Computed'])

export const rule = defineRule({
  create(context) {
    return {
      TSTypeReference(node) {
        if (node.typeName.type !== 'Identifier' || !FORBIDDEN_TYPES.has(node.typeName.name)) {
          return
        }

        for (let current: ESTree.Node = node; current.parent; current = current.parent) {
          const { parent } = current

          if (parent.type === 'TSInterfaceDeclaration') {
            if (parent.id.name.endsWith('Props')) {
              context.report({
                node,
                message: `${node.typeName.name}<> is not allowed in Props interfaces. Pass plain values instead.`,
              })
            }

            return
          }
        }
      },
    }
  },
})
