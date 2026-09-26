import type { Context, ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const UNIT_PATTERN = /^\d+(?:\.\d+)?(?:px|em|rem|%)$/u

const getKeyName = (key: ESTree.Node) => {
  if (key.type === 'Identifier') {
    return key.name
  }

  if (key.type === 'Literal') {
    return key.value
  }

  return null
}

const isHardcodedSize = (node: ESTree.Node): node is ESTree.StringLiteral =>
  node.type === 'Literal' && typeof node.value === 'string' && UNIT_PATTERN.test(node.value)

const reportHardcodedSize = (context: Context, node: ESTree.StringLiteral) => {
  context.report({
    node,
    message: `Hardcoded font-size '${node.value}' is not allowed. Use a typography token (xs, sm, md, lg, xl, 2xl) instead.`,
  })
}

export const rule = defineRule({
  create(context) {
    return {
      Property(node) {
        if (getKeyName(node.key) !== 'fontSize') {
          return
        }

        if (isHardcodedSize(node.value)) {
          reportHardcodedSize(context, node.value)

          return
        }

        if (node.value.type !== 'ObjectExpression') {
          return
        }

        for (const prop of node.value.properties) {
          if (prop.type === 'Property' && isHardcodedSize(prop.value)) {
            reportHardcodedSize(context, prop.value)
          }
        }
      },
    }
  },
})
