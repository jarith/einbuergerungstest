import type { Meta, StoryObj } from '@storybook/react-vite'

import { ToggleSwitch } from './toggle-switch'

const meta = {
  title: 'Components/ToggleSwitch',
  component: ToggleSwitch,
  args: { label: 'English translation' },
} satisfies Meta<typeof ToggleSwitch>

export default meta

type Story = StoryObj<typeof meta>

export const On = { args: { defaultChecked: true } } satisfies Story

export const Off = {} satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story
