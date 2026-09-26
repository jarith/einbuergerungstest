import type { Meta, StoryObj } from '@storybook/react-vite'

import { NavigationItem } from './navigation-item'

const meta = {
  title: 'Components/NavigationItem',
  component: NavigationItem,
  args: { label: 'Study' },
} satisfies Meta<typeof NavigationItem>

export default meta

type Story = StoryObj<typeof meta>

export const Current = { args: { active: true } } satisfies Story

export const Inactive = {} satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story
