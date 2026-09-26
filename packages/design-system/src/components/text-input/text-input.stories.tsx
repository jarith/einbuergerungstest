import type { Meta, StoryObj } from '@storybook/react-vite'

import { TextInput } from './text-input'

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  args: { label: 'Project name', description: 'Choose a name for your next idea.' },
} satisfies Meta<typeof TextInput>

export default meta

type Story = StoryObj<typeof meta>

export const Default = {} satisfies Story

export const Invalid = { args: { error: 'Enter a project name.' } } satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story
