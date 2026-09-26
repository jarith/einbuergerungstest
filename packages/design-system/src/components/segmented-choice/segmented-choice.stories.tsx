import type { Meta, StoryObj } from '@storybook/react-vite'

import { SegmentedChoice } from './segmented-choice'

const meta = {
  title: 'Components/SegmentedChoice',
  component: SegmentedChoice,
  args: {
    'aria-label': 'Question status filter',
    data: ['All', 'Correct', 'Incorrect', 'Untried'],
    defaultValue: 'All',
  },
} satisfies Meta<typeof SegmentedChoice>

export default meta

type Story = StoryObj<typeof meta>

export const Filters = { args: { density: 'compact' } } satisfies Story

export const Appearance = {
  args: { 'aria-label': 'Appearance', data: ['Light', 'Dark'], defaultValue: 'Light' },
} satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story
