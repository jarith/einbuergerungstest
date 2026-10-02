import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Continue' },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Solid = {} satisfies Story

export const Outline = { args: { appearance: 'outline' } } satisfies Story

export const Danger = {
  args: { appearance: 'danger', children: 'Delete device data' },
} satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story

export const Ghost = { args: { appearance: 'ghost' } } satisfies Story

export const Loading = { args: { loading: true } } satisfies Story
