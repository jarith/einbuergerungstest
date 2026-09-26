import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../../../components/button/button'
import { Panel } from '../../../components/panel/panel'
import { TextInput } from '../../../components/text-input/text-input'

const ComponentExamples = () => (
  <Panel aria-label="Project settings">
    <TextInput
      label="Project name"
      description="Choose a name for your next idea."
      defaultValue="My next app"
    />
    <Button>Save project</Button>
  </Panel>
)

const meta = { title: 'Foundation/Components', component: ComponentExamples } satisfies Meta<
  typeof ComponentExamples
>

export default meta

type Story = StoryObj<typeof meta>

export const Composition = {} satisfies Story
