import { defineConfig } from '@pandacss/dev'

import { resolve } from 'node:path'

import { pandaTheme, globalStyles } from './src/foundation/panda/panda-theme'
import { patterns } from './src/foundation/panda/patterns'
import { slotRecipes } from './src/foundation/panda/recipes'

export default defineConfig({
  preflight: false,
  presets: ['@pandacss/preset-base'],
  strictTokens: true,
  strictPropertyValues: true,
  // PostCSS registers watch paths relative to each consuming process.
  include: [
    resolve(__dirname, 'src/**/*.{ts,tsx}'),
    resolve(__dirname, '../../web/src/**/*.{ts,tsx}'),
  ],
  exclude: [
    '**/*.test.{ts,tsx}',
    '**/styled-system/**',
    ...(process.env['PANDA_INCLUDE_STORIES'] === 'true'
      ? []
      : ['**/*.stories.tsx', '**/*.stories.styles.ts']),
  ],
  outdir: 'styled-system',
  importMap: {
    css: '@einbuergerungstest/design-system',
    patterns: '@einbuergerungstest/design-system',
  },
  conditions: {
    extend: {
      alternate: '[data-ds-theme=alternate] &',
      dark: '[data-mantine-color-scheme=dark] &',
      light: '[data-mantine-color-scheme=light] &',
    },
  },
  patterns,
  globalCss: globalStyles,
  theme: { ...pandaTheme, extend: { slotRecipes } },
  staticCss: { recipes: Object.fromEntries(Object.keys(slotRecipes).map((name) => [name, ['*']])) },
})
