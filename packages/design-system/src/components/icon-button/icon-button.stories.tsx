import type { Meta, StoryObj } from '@storybook/react-vite'

import { IconButton } from './icon-button'

const MenuGlyph = () => <span aria-hidden="true">☰</span>

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Open menu', children: <MenuGlyph /> },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Outline = {} satisfies Story

export const Solid = { args: { appearance: 'solid' } } satisfies Story

export const Disabled = { args: { disabled: true } } satisfies Story
