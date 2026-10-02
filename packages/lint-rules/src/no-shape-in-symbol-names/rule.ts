/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import type { ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const FORBIDDEN_SYMBOL_NAME = 'shape'

const containsForbiddenSymbolName = (name: string) => {
  return name.toLowerCase().includes(FORBIDDEN_SYMBOL_NAME)
}

/** Return whether an identifier names a statically accessed member owned by another value. */
const isBorrowedMemberName = (node: ESTree.Node) => {
  const parent = node.parent
  if (parent === null || parent.type !== 'MemberExpression') return false
  return parent.property === node && parent.computed === false
}

/** Ban the case-insensitive substring "shape" in every JavaScript and TypeScript symbol name. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the case-insensitive substring "shape" in JavaScript, TypeScript, private, and JSX symbol names.',
    },
    messages: {
      forbiddenSymbolName:
        'Rename symbol "{{name}}" for its domain role; "shape" describes structure rather than ownership.',
    },
  },
  createOnce(context) {
    const reportForbiddenSymbolName = (
      node: Extract<ESTree.Node, { type: 'Identifier' | 'PrivateIdentifier' | 'JSXIdentifier' }>,
    ) => {
      if (!containsForbiddenSymbolName(node.name) || isBorrowedMemberName(node)) return
      context.report({
        node,
        messageId: 'forbiddenSymbolName',
        data: { name: node.name },
      })
    }

    return {
      Identifier: reportForbiddenSymbolName,
      PrivateIdentifier: reportForbiddenSymbolName,
      JSXIdentifier: reportForbiddenSymbolName,
    }
  },
})
