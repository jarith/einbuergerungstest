import type { Meta, StoryObj } from '@storybook/react-vite'

import { Calendar } from './calendar'

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  args: {
    label: 'Planned test date',
    description: 'Optional · today or a future date',
    clearable: true,
    clearButtonProps: { 'aria-label': 'Clear date' },
  },
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

export const Default = {} satisfies Story

export const Selected = { args: { defaultValue: '2026-10-29' } } satisfies Story

export const MinimumDate = {
  args: { minDate: '2026-10-04', defaultDate: '2026-10-04' },
} satisfies Story

export const Invalid = { args: { error: 'Choose today or a future test date.' } } satisfies Story

export const Disabled = { args: { defaultValue: '2026-10-29', disabled: true } } satisfies Story
