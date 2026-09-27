import type { Meta, StoryObj } from '@storybook/react-vite'
// oxlint-disable-next-line eslint/no-restricted-imports -- This interactive story owns its open state locally.
import { useState } from 'react'

import type { DialogProps } from './dialog'
import { Button } from '../button/button'
import { Dialog } from './dialog'

const DialogExample = (props: DialogProps) => {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Button onClick={() => setOpened(true)}>Submit test</Button>
      <Dialog {...props} opened={opened} onClose={() => setOpened(false)}>
        <p>32 questions are unanswered. Submitting now counts them as incorrect.</p>
        <Button appearance="outline" onClick={() => setOpened(false)}>
          Open question list
        </Button>
      </Dialog>
    </>
  )
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: { opened: false, onClose: () => {}, title: 'Submit the mock test?' },
  render: (args) => <DialogExample {...args} />,
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Confirmation = {} satisfies Story
