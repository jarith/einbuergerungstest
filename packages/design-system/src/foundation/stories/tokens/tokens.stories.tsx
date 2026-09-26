import type { Meta, StoryObj } from '@storybook/react-vite'

import { tokenStyles } from './tokens.stories.styles'

const TokenExamples = () => (
  <div className={tokenStyles.content}>
    <div className={tokenStyles.swatches}>
      <div className={tokenStyles.surface}>Surface / primary content</div>
      <div className={tokenStyles.accent}>Accent / action foreground</div>
    </div>
    <h2 className={tokenStyles.heading}>Heading</h2>
    <p className={tokenStyles.body}>Body text uses the same tokens as application content.</p>
    <p className={tokenStyles.caption}>
      Change Theme and Skin in the toolbar to inspect the roles.
    </p>
  </div>
)

const meta = { title: 'Foundation/Tokens', component: TokenExamples } satisfies Meta<
  typeof TokenExamples
>

export default meta

type Story = StoryObj<typeof meta>

export const Roles = {} satisfies Story
