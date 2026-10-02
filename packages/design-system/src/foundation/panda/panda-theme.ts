import { defineGlobalStyles, defineLayerStyles, defineTextStyles } from '@pandacss/dev'

import type { ColorScheme } from '../../tokens/tokens'
import { colorRoles, colorStates } from '../../tokens/semantics'
import { alternateTheme, baselineTheme } from '../../tokens/themes'

const toRem = (value: number) => `${value / 16}rem`

const toPx = (value: number) => `${value}px`

// Derive from theme geometry: Panda cannot resolve flat dotted keys in token-to-token references.
const shellPadding = (panel: number, inline: number) => ({
  'shell.pagePadding': `${toRem(panel)} max(env(safe-area-inset-right), ${toRem(panel)}) ${toRem(panel)} max(env(safe-area-inset-left), ${toRem(panel)})`,
  'shell.headerPadding': `max(env(safe-area-inset-top), ${toRem(panel)}) max(env(safe-area-inset-right), ${toRem(panel)}) ${toRem(panel)} max(env(safe-area-inset-left), ${toRem(panel)})`,
  'shell.navigationPadding': `${toRem(inline)} max(env(safe-area-inset-right), ${toRem(inline)}) max(env(safe-area-inset-bottom), ${toRem(inline)}) max(env(safe-area-inset-left), ${toRem(inline)})`,
})

const project = <T extends string | number>(
  base: Readonly<Record<string, T>>,
  alternate: Readonly<Record<string, T>>,
  format: (value: T) => string,
) =>
  Object.fromEntries(
    Object.entries(base).map(([key, value]) => [
      key,
      { value: { base: format(value), _alternate: format(alternate[key] ?? value) } },
    ]),
  )

const textRoles = {
  body: ['16', 'regular'],
  controlLabel: ['14', 'semibold'],
  actionLabel: ['15', 'semibold'],
  caption: ['14', 'regular'],
  choiceDescription: ['13', 'regular'],
  overline: ['12', 'bold'],
  heading: ['20', 'semibold'],
  dialogTitle: ['28', 'bold'],
  title: ['32', 'bold'],
} as const

const alternateColors: Readonly<Record<string, Readonly<Record<ColorScheme, string>>>> =
  alternateTheme.colors

export const pandaTheme = {
  semanticTokens: {
    colors: {
      ...Object.fromEntries(
        Object.entries(baselineTheme.colors).map(([key, value]) => [
          key,
          {
            value: {
              base: value.light,
              _dark: value.dark,
              _alternate: {
                base: alternateColors[key]?.light ?? value.light,
                _dark: alternateColors[key]?.dark ?? value.dark,
              },
            },
          },
        ]),
      ),
      ...Object.fromEntries(
        Object.entries(colorRoles).map(([key, value]) => [key, { value: `{colors.${value}}` }]),
      ),
      ...Object.fromEntries(
        Object.entries(colorStates).map(([key, value]) => [
          key,
          { value: { base: value.light, _dark: value.dark } },
        ]),
      ),
    },
    spacing: {
      ...project(baselineTheme.spacing, alternateTheme.spacing, toRem),
      ...project(baselineTheme.geometry.spacing, alternateTheme.geometry.spacing, toRem),
      ...project(
        shellPadding(
          baselineTheme.geometry.spacing['panel.padding'],
          baselineTheme.geometry.spacing['layout.inline'],
        ),
        shellPadding(
          alternateTheme.geometry.spacing['panel.padding'],
          alternateTheme.geometry.spacing['layout.inline'],
        ),
        String,
      ),
    },
    fontSizes: project(baselineTheme.fontSizes, alternateTheme.fontSizes, toRem),
    lineHeights: project(baselineTheme.lineHeights, alternateTheme.lineHeights, String),
    fontWeights: project(baselineTheme.fontWeights, alternateTheme.fontWeights, String),
    fonts: project(baselineTheme.fonts, alternateTheme.fonts, String),
    sizes: project(baselineTheme.geometry.sizes, alternateTheme.geometry.sizes, toRem),
    radii: project(baselineTheme.geometry.radii, alternateTheme.geometry.radii, toRem),
    borderWidths: project(
      baselineTheme.geometry.borderWidths,
      alternateTheme.geometry.borderWidths,
      toPx,
    ),
    opacity: project(baselineTheme.geometry.opacity, alternateTheme.geometry.opacity, String),
    shadows: project(baselineTheme.elevation, alternateTheme.elevation, String),
  },
  textStyles: defineTextStyles(
    Object.fromEntries(
      Object.entries(textRoles).map(([name, [size, weight]]) => [
        name,
        {
          value: {
            fontFamily: '{fonts.ui}',
            fontSize: `{fontSizes.${size}}`,
            fontWeight: `{fontWeights.${weight}}`,
            lineHeight: `{lineHeights.${size}}`,
          },
        },
      ]),
    ),
  ),
  layerStyles: defineLayerStyles({
    panel: {
      value: {
        backgroundColor: 'panel.bg',
        color: 'content.primary',
        border: '{borderWidths.control} solid {colors.panel.border}',
        borderRadius: 'panel',
        boxShadow: 'panel',
      },
    },
    field: {
      value: {
        backgroundColor: 'field.bg',
        color: 'field.fg',
        border: '{borderWidths.control} solid {colors.field.border}',
        borderRadius: 'field',
      },
    },
    focus: {
      value: {
        outline: '{borderWidths.focus} solid {colors.focus.outer}',
        outlineOffset: '{spacing.focus.offset}',
        boxShadow: '0 0 0 {spacing.focus.offset} {colors.focus.inner}',
      },
    },
  }),
}

export const globalStyles = defineGlobalStyles({
  // Reset native text margins once; layout primitives own spacing between elements.
  ':where(h1, h2, p)': { margin: 0 },
  body: { textStyle: 'body', backgroundColor: 'canvas', color: 'content.primary' },
  ':where(:focus-visible), .ds-focus:focus-visible': { layerStyle: 'focus' },
  '*, *::before, *::after': {
    _motionReduce: { animationDuration: '0.01ms!', transitionDuration: '0.01ms!' },
  },
})
