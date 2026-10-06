import type { Meta, StoryObj } from '@storybook/react-vite'

import { Accordion } from './accordion'

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  render: (args) => (
    <Accordion {...args}>
      <Accordion.Item value="constitution">
        <Accordion.Control>Constitution, rights, and democratic principles</Accordion.Control>
        <Accordion.Panel>27 questions in this group.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="federal">
        <Accordion.Control>Federal structure, state identity, and symbols</Accordion.Control>
        <Accordion.Panel>24 questions in this group.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

export const Collapsed = {} satisfies Story

export const IndependentGroups = {
  args: { multiple: true, defaultValue: ['constitution', 'federal'] },
} satisfies Story
