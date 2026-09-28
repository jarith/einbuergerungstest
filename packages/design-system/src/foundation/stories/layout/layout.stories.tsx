import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'

import { Button } from '../../../components/button/button'
import { Panel } from '../../../components/panel/panel'

const LayoutExamples = () => (
  <Stack as="section" aria-label="Layout composition">
    <Panel aria-label="Stack example">Stack uses the shared section gap.</Panel>
    <Toolbar role="toolbar" aria-label="Actions">
      <Button>Save</Button>
      <Button appearance="outline">Cancel</Button>
      <Button appearance="ghost">More actions</Button>
    </Toolbar>
  </Stack>
)

const meta = { title: 'Foundation/Layout', component: LayoutExamples } satisfies Meta<
  typeof LayoutExamples
>

export default meta

type Story = StoryObj<typeof meta>

export const Composition = {} satisfies Story
