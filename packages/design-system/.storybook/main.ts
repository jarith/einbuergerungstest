import type { StorybookConfig } from '@storybook/react-vite'
import type { UserConfig } from 'vite'
import { mergeConfig } from 'vite'

const config = {
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      build: {
        rolldownOptions: {
          onLog(level, log, defaultHandler) {
            // These RSC directives have no meaning in the client-only story workbench.
            if (
              log.code === 'MODULE_LEVEL_DIRECTIVE' &&
              log.message.includes('use client') &&
              log.message.includes('@mantine/')
            )
              return

            defaultHandler(level, log)
          },
        },
      },
    } satisfies UserConfig),
} satisfies StorybookConfig

export default config
