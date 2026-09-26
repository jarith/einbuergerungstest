import type { Context, ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const layerPrefixes = ['@shared/', '@entities/', '@features/', '@pages/']

const getDeepImportSliceRoot = (source: string) => {
  for (const prefix of layerPrefixes) {
    if (!source.startsWith(prefix)) {
      continue
    }

    const rest = source.slice(prefix.length)
    const slashIndex = rest.indexOf('/')

    if (slashIndex !== -1) {
      return prefix + rest.slice(0, slashIndex)
    }
  }

  return null
}

const checkNode = (
  context: Context,
  node: ESTree.ImportDeclaration | ESTree.ExportNamedDeclaration,
) => {
  if (node.source === null) {
    return
  }

  const source = node.source.value
  const sliceRoot = getDeepImportSliceRoot(source)

  if (sliceRoot !== null) {
    context.report({
      node,
      message: `Deep imports from '${source}' are not allowed. Import from '${sliceRoot}' instead.`,
    })
  }
}

export const rule = defineRule({
  create(context) {
    return {
      ImportDeclaration(node) {
        checkNode(context, node)
      },
      ExportNamedDeclaration(node) {
        checkNode(context, node)
      },
    }
  },
})
