import type { Meta, StoryObj } from '@storybook/react-vite'

import { InlineNotice } from './inline-notice'

const meta = {
  title: 'Components/InlineNotice',
  component: InlineNotice,
  args: { title: 'Question status', children: 'Choose an answer to see feedback.' },
} satisfies Meta<typeof InlineNotice>

export default meta

type Story = StoryObj<typeof meta>

export const Information = {} satisfies Story

export const Correct = {
  args: { intent: 'success', title: 'Correct answer', children: 'Your answer has been saved.' },
} satisfies Story

export const Incorrect = {
  args: { intent: 'danger', title: 'Not quite', children: 'Try again to update your status.' },
} satisfies Story

export const Warning = {
  args: { intent: 'warning', title: 'Unanswered questions', children: '32 questions remain.' },
} satisfies Story
