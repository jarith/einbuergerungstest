import type { Meta, StoryObj } from '@storybook/react-vite'

import { ProgressBar } from './progress-bar'

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  args: { 'aria-label': 'Constitution questions solved', value: 4 },
} satisfies Meta<typeof ProgressBar>

export default meta

type Story = StoryObj<typeof meta>

export const Started = {} satisfies Story

export const Halfway = { args: { value: 50 } } satisfies Story

export const Complete = { args: { value: 100 } } satisfies Story
