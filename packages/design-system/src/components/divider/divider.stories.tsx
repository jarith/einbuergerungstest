import type { Meta, StoryObj } from '@storybook/react-vite'

import { Divider } from './divider'

const meta = { title: 'Components/Divider', component: Divider } satisfies Meta<typeof Divider>

export default meta

type Story = StoryObj<typeof meta>

export const Plain = {} satisfies Story

export const WithLabel = { args: { label: 'Question status' } } satisfies Story
