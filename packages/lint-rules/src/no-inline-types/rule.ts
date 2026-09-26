import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const FUNCTION_LIKE = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'TSFunctionType',
  'TSConstructorType',
  'TSMethodSignature',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
])

const TYPE_DECLARATION = new Set(['TSTypeAliasDeclaration', 'TSInterfaceDeclaration'])

const classifyFunctionChild = (child: ESTree.Node, parent: ESTree.Node) => {
  if ('returnType' in parent && child === parent.returnType) {
    return 'return-type'
  }

  if ('params' in parent && parent.params.some((parameter) => parameter === child)) {
    return 'parameter'
  }

  return null
}

const findInlineTypePosition = (node: ESTree.Node) => {
  for (let current = node; current.parent; current = current.parent) {
    const { parent } = current

    if (TYPE_DECLARATION.has(parent.type)) {
      return null
    }

    if (FUNCTION_LIKE.has(parent.type)) {
      return classifyFunctionChild(current, parent)
    }
  }

  return null
}

const INLINE_TYPE_MESSAGES = {
  'return-type': 'Inline object type in return type. Use a named interface or type alias.',
  parameter: 'Inline object type in parameter. Use a named interface or type alias.',
}

export const rule = defineRule({
  create(context) {
    return {
      TSTypeLiteral(node) {
        const position = findInlineTypePosition(node)

        if (position === null) {
          return
        }

        const message = INLINE_TYPE_MESSAGES[position]

        if (message !== undefined) {
          context.report({ node, message })
        }
      },
    }
  },
})
