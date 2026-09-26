import type { Context, Visitor } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const isParentPath = (source: string) => /^\.\.(?:[/\\]|$)/u.test(source)

const createIndexFileVisitors = (context: Context): Visitor => {
  const importedFromParent = new Set<string>()

  return {
    ImportDeclaration(node) {
      if (isParentPath(node.source.value)) {
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier') {
            importedFromParent.add(specifier.local.name)
          }
        }
      }
    },
    ExportNamedDeclaration(node) {
      if (node.source !== null) {
        if (isParentPath(node.source.value)) {
          context.report({
            node,
            message:
              'Index files must not re-export from parent directories. Import from a sibling module instead.',
          })
        }
      } else if (node.declaration === null && node.specifiers.length > 0) {
        for (const specifier of node.specifiers) {
          if (
            specifier.local.type === 'Identifier' &&
            importedFromParent.has(specifier.local.name)
          ) {
            context.report({
              node,
              message:
                'Index files must not re-export from parent directories. Import from a sibling module instead.',
            })

            break
          }
        }
      }
    },
    ExportAllDeclaration(node) {
      if (isParentPath(node.source.value)) {
        context.report({
          node,
          message:
            'Index files must not re-export from parent directories. Import from a sibling module instead.',
        })
      }
    },
  }
}

const createNonIndexFileVisitors = (context: Context): Visitor => {
  const importedNames = new Set<string>()

  return {
    ImportDeclaration(node) {
      for (const specifier of node.specifiers) {
        if (specifier.type === 'ImportSpecifier') {
          importedNames.add(specifier.local.name)
        }
      }
    },
    ExportNamedDeclaration(node) {
      if (node.source !== null) {
        context.report({
          node,
          message:
            'Re-exports are only allowed in index files. Move this re-export to an index file or use a direct export instead.',
        })
      } else if (node.declaration === null && node.specifiers.length > 0) {
        for (const specifier of node.specifiers) {
          if (specifier.local.type === 'Identifier' && importedNames.has(specifier.local.name)) {
            context.report({
              node,
              message:
                'Re-exports are only allowed in index files. Move this re-export to an index file or use a direct export instead.',
            })

            break
          }
        }
      }
    },
    ExportAllDeclaration(node) {
      context.report({
        node,
        message:
          'Re-exports are only allowed in index files. Move this re-export to an index file or use a direct export instead.',
      })
    },
  }
}

export const rule = defineRule({
  create(context) {
    const { filename } = context
    const isIndex = /[/\\]index\.[jt]sx?$/u.test(filename)

    return isIndex ? createIndexFileVisitors(context) : createNonIndexFileVisitors(context)
  },
})
