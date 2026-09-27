import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatusBadge } from './status-badge'

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
  args: { children: 'Not tried yet' },
} satisfies Meta<typeof StatusBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Neutral = {} satisfies Story

export const Correct = { args: { intent: 'success', children: 'Correct' } } satisfies Story

export const Incorrect = { args: { intent: 'danger', children: 'Incorrect' } } satisfies Story

export const Unanswered = { args: { intent: 'warning', children: 'Unanswered' } } satisfies Story

export const Information = { args: { intent: 'info', children: 'In progress' } } satisfies Story
