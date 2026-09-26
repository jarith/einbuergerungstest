import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../../../components/button/button'
import { Panel } from '../../../components/panel/panel'
import { layoutStyles } from './layout.stories.styles'

const LayoutExamples = () => (
  <div className={layoutStyles.stack}>
    <Panel aria-label="Stack example">Stack uses the shared section gap.</Panel>
    <div className={layoutStyles.toolbar}>
      <Button>Save</Button>
      <Button appearance="outline">Cancel</Button>
      <Button appearance="ghost">More actions</Button>
    </div>
  </div>
)

const meta = { title: 'Foundation/Layout', component: LayoutExamples } satisfies Meta<
  typeof LayoutExamples
>

export default meta

type Story = StoryObj<typeof meta>

export const Composition = {} satisfies Story
