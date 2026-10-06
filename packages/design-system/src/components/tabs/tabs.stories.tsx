import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tabs } from './tabs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'questions' },
  render: (args) => (
    <Tabs {...args}>
      <Tabs.List aria-label="Progress">
        <Tabs.Tab value="questions">Question status</Tabs.Tab>
        <Tabs.Tab value="tests">Mock tests</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="questions">Browse questions by learning status.</Tabs.Panel>
      <Tabs.Panel value="tests">Your completed and unfinished tests appear here.</Tabs.Panel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const QuestionStatus = {} satisfies Story

export const MockTests = { args: { defaultValue: 'tests' } } satisfies Story
