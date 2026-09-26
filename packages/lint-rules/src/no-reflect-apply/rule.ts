/* oxlint-disable -- Vendored anti-slop implementation; see src/anti-slop/UPSTREAM.md. */

import { defineRule } from '@oxlint/plugins'

import { isGlobalReflectMethodCall } from '../anti-slop/shared/reflect-method.ts'

/** Ban Reflect.apply, which bypasses ordinary typed function calls. */
export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Reflect.apply; call typed functions directly or model dynamic dispatch behind an interface.',
    },
    messages: {
      reflectApply:
        'Replace `Reflect.apply` with a typed function call. Model dynamic dispatch behind a named interface.',
    },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        if (node.callee.type === 'Super' || node.callee.type === 'V8IntrinsicExpression') return
        if (isGlobalReflectMethodCall(context.sourceCode, node.callee, 'apply')) {
          context.report({ node, messageId: 'reflectApply' })
        }
      },
    }
  },
})
