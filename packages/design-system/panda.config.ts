import { defineConfig } from '@pandacss/dev'

import { pandaTheme, globalStyles } from './src/foundation/panda/panda-theme'
import { patterns } from './src/foundation/panda/patterns'
import { slotRecipes } from './src/foundation/panda/recipes'

export default defineConfig({
  preflight: false,
  presets: ['@pandacss/preset-base'],
  strictTokens: true,
  strictPropertyValues: true,
  // Panda v2 source admission requires globs relative to the configured PostCSS/CLI cwd.
  include: ['src/**/*.{ts,tsx}', '../../web/src/**/*.{ts,tsx}'],
  exclude: [
    '**/*.test.{ts,tsx}',
    '**/styled-system/**',
    ...(process.env['PANDA_INCLUDE_STORIES'] === 'true'
      ? []
      : ['**/*.stories.tsx', '**/*.stories.styles.ts']),
  ],
  outdir: 'styled-system',
  jsxFramework: 'react',
  importMap: {
    css: '@einbuergerungstest/design-system',
    patterns: '@einbuergerungstest/design-system',
    jsx: '@einbuergerungstest/design-system/jsx',
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
