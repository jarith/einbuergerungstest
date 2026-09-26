import type { Context, ESTree } from '@oxlint/plugins'
import { defineRule } from '@oxlint/plugins'

const HEX_PATTERN = /^#[\dA-Fa-f]{3,8}$/u

const RGB_PATTERN = /^rgba?\(.+\)$/u

const SHADOW_COLOR_PATTERN = /(?:rgba?\(|#[\dA-Fa-f]{3,8})/u

const BORDER_HEX_PATTERN = /#[\dA-Fa-f]{3,8}/u

const COLOR_PROPS = new Set([
  'color',
  'bg',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'fill',
  'stroke',
  'outlineColor',
])

const SPACING_PROPS = new Set([
  'padding',
  'p',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'margin',
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'gap',
  'rowGap',
  'columnGap',
])

const RADIUS_PROPS = new Set([
  'borderRadius',
  'rounded',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
])

const SHADOW_PROPS = new Set(['boxShadow', 'shadow'])

const SIZE_PROPS = new Set([
  'width',
  'w',
  'height',
  'h',
  'minWidth',
  'minW',
  'minHeight',
  'minH',
  'maxWidth',
  'maxW',
  'maxHeight',
  'maxH',
  'size',
])

const BORDER_PROPS = new Set(['border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight'])

const SPACING_PX = new Set(['4px', '8px', '16px', '24px', '32px'])

const RADIUS_PX = new Set(['4px', '8px', '12px', '24px', '9999px'])

const SIZING_PX = new Set(['8px', '12px', '16px', '20px', '24px', '32px', '40px', '48px'])

const WEIGHT_VALUES = new Set(['400', '500', '600', '700'])

const LH_VALUES = new Set(['1.25', '1.5', '1.75'])

const isColorLiteral = (v: string) => HEX_PATTERN.test(v) || RGB_PATTERN.test(v)

const CHECKS = [
  {
    props: COLOR_PROPS,
    test: isColorLiteral,
    msg: (v: string) => `Hardcoded color '${v}'. Use a color token instead.`,
  },
  {
    props: SPACING_PROPS,
    test: (v: string) => SPACING_PX.has(v),
    msg: (v: string) => `Hardcoded spacing '${v}'. Use a spacing token (xs/sm/md/lg/xl) instead.`,
  },
  {
    props: RADIUS_PROPS,
    test: (v: string) => RADIUS_PX.has(v),
    msg: (v: string) => `Hardcoded radius '${v}'. Use a radius token (sm/md/lg/xl/full) instead.`,
  },
  {
    props: SHADOW_PROPS,
    test: (v: string) => SHADOW_COLOR_PATTERN.test(v),
    msg: () => `Hardcoded shadow literal. Use a shadow token (sm/md/lg) instead.`,
  },
  {
    props: SIZE_PROPS,
    test: (v: string) => SIZING_PX.has(v),
    msg: (v: string) =>
      `Hardcoded size '${v}'. Use a sizing token (2xs/xs/sm/md/lg/xl/2xl/3xl) instead.`,
  },
  {
    props: new Set(['fontWeight']),
    test: (v: string) => WEIGHT_VALUES.has(v),
    msg: (v: string) =>
      `Hardcoded font-weight '${v}'. Use a font-weight token (normal/medium/semibold/bold) instead.`,
  },
  {
    props: new Set(['lineHeight']),
    test: (v: string) => LH_VALUES.has(v),
    msg: (v: string) =>
      `Hardcoded line-height '${v}'. Use a line-height token (tight/normal/relaxed) instead.`,
  },
  {
    props: BORDER_PROPS,
    test: (v: string) => BORDER_HEX_PATTERN.test(v),
    msg: () => `Hardcoded color in border value. Use borderColor with a color token instead.`,
  },
]

const getKeyName = (key: ESTree.Node) => {
  if (key.type === 'Identifier') {
    return key.name
  }

  if (key.type === 'Literal') {
    return key.value
  }

  return null
}

const getViolation = (propName: string, value: string) => {
  for (const check of CHECKS) {
    if (check.props.has(propName) && check.test(value)) {
      return check.msg(value)
    }
  }

  return null
}

const checkValue = (context: Context, propName: string, node: ESTree.Node) => {
  if (node.type !== 'Literal' || typeof node.value !== 'string') {
    return
  }
  const message = getViolation(propName, node.value)

  if (message !== null) {
    context.report({ node, message })
  }
}

const checkProperty = (
  context: Context,
  node: ESTree.ObjectProperty | ESTree.BindingProperty | ESTree.AssignmentTargetProperty,
) => {
  const propName = getKeyName(node.key)

  if (typeof propName !== 'string') {
    return
  }

  checkValue(context, propName, node.value)

  if (node.value.type !== 'ObjectExpression') {
    return
  }

  for (const prop of node.value.properties) {
    if (prop.type === 'Property') {
      checkValue(context, propName, prop.value)
    }
  }
}

export const rule = defineRule({
  create(context) {
    return {
      Property(node) {
        checkProperty(context, node)
      },
    }
  },
})
