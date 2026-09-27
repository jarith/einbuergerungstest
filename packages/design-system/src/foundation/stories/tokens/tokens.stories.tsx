import type { Meta, StoryObj } from '@storybook/react-vite'
import { cx } from '@einbuergerungstest/design-system'

import { tokenStyles } from './tokens.stories.styles'

const swatches = [
  { label: 'Canvas / primary content', className: tokenStyles.canvas },
  { label: 'Surface / primary content', className: tokenStyles.surface },
  { label: 'Muted surface / primary content', className: tokenStyles.muted },
  { label: 'Accent / action foreground', className: tokenStyles.accent },
  { label: 'Success', className: tokenStyles.success },
  { label: 'Warning', className: tokenStyles.warning },
  { label: 'Danger', className: tokenStyles.danger },
  { label: 'Info', className: tokenStyles.info },
] as const

const TokenExamples = () => (
  <div className={tokenStyles.content}>
    <div className={tokenStyles.swatches}>
      {swatches.map((swatch) => (
        <div key={swatch.label} className={cx(tokenStyles.swatch, swatch.className)}>
          {swatch.label}
        </div>
      ))}
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
