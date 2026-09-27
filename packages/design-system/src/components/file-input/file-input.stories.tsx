import type { Meta, StoryObj } from '@storybook/react-vite'

import { FileInput } from './file-input'

const meta = {
  title: 'Components/FileInput',
  component: FileInput,
  args: {
    label: 'Import backup',
    placeholder: 'Choose a backup file',
    accept: '.json,application/json',
  },
} satisfies Meta<typeof FileInput>

export default meta

type Story = StoryObj<typeof meta>

export const Empty = {} satisfies Story

export const Invalid = { args: { error: 'Choose a valid backup file.' } } satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story
