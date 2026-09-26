import type { Preview } from '@storybook/react-vite'

import { DesignSystemProvider } from '../src'

import '../src/styles.css'

const preview = {
  tags: ['autodocs'],
  globalTypes: {
    skin: {
      description: 'Token-only skin',
      toolbar: { title: 'Skin', items: ['baseline', 'alternate'], dynamicTitle: true },
    },
    colorScheme: {
      description: 'Color scheme',
      toolbar: { title: 'Theme', icon: 'paintbrush', items: ['light', 'dark'] },
    },
  },
  initialGlobals: { colorScheme: 'light', skin: 'baseline' },
  decorators: [
    (Story, { globals }) => (
      <DesignSystemProvider
        colorScheme={globals['colorScheme'] === 'dark' ? 'dark' : 'light'}
        skin={globals['skin'] === 'alternate' ? 'alternate' : 'baseline'}
      >
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: { layout: 'padded' },
} satisfies Preview

export default preview
