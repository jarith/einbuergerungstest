import type { Meta, StoryObj } from '@storybook/react-vite'

import { Panel } from './panel'

const meta = {
  title: 'Components/Panel',
  component: Panel,
  args: { 'aria-label': 'Example panel', children: 'A shared surface for your application.' },
} satisfies Meta<typeof Panel>

export default meta

type Story = StoryObj<typeof meta>

export const Default = {} satisfies Story
