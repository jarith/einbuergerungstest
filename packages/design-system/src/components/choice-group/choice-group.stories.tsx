import type { Meta, StoryObj } from '@storybook/react-vite'

import { ChoiceGroup } from './choice-group'

const answers = [
  {
    value: 'a',
    marker: 'A',
    label: 'hier Religionsfreiheit gilt.',
    description: 'there is freedom of religion here.',
  },
  {
    value: 'b',
    marker: 'B',
    label: 'hier Menschen Steuern zahlen müssen.',
    description: 'people must pay taxes here.',
  },
  {
    value: 'c',
    marker: 'C',
    label: 'hier Menschen wählen dürfen.',
    description: 'people are allowed to vote here.',
  },
  {
    value: 'd',
    marker: 'D',
    label: 'hier Meinungsfreiheit gilt.',
    description: 'there is freedom of speech here.',
  },
] as const

const meta = {
  title: 'Components/ChoiceGroup',
  component: ChoiceGroup,
  args: { label: 'What does the Basic Law protect?', options: answers },
} satisfies Meta<typeof ChoiceGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Unanswered = {} satisfies Story

export const Selected = { args: { defaultValue: 'b' } } satisfies Story

export const Feedback = {
  args: {
    defaultValue: 'a',
    options: answers.map((answer) => ({
      ...answer,
      ...(answer.value === 'a' && { result: 'incorrect' as const }),
      ...(answer.value === 'd' && { result: 'correct' as const }),
    })),
  },
} satisfies Story
