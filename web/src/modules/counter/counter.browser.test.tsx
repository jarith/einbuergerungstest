import { DesignSystemProvider } from '@app/design-system'
import { StrictMode } from 'react'
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { Counter } from './counter'

import '@app/design-system/styles.css'

test('binds state to the view and resets state after unmount', async () => {
  const first = await render(
    <StrictMode>
      <DesignSystemProvider>
        <Counter />
      </DesignSystemProvider>
    </StrictMode>,
  )

  await first.getByRole('button', { name: 'Increment' }).click()

  await expect.element(first.getByRole('status', { name: 'Count' })).toHaveTextContent('1')

  await first.unmount()

  const second = await render(
    <DesignSystemProvider>
      <Counter />
    </DesignSystemProvider>,
  )

  await expect.element(second.getByRole('status', { name: 'Count' })).toHaveTextContent('0')

  await expect.element(second.getByRole('button', { name: 'Reset' })).toBeDisabled()
})

test('mounted counters do not share state', async () => {
  const screen = await render(
    <DesignSystemProvider>
      <fieldset aria-label="First counter">
        <Counter />
      </fieldset>
      <fieldset aria-label="Second counter">
        <Counter />
      </fieldset>
    </DesignSystemProvider>,
  )

  const first = screen.getByRole('group', { name: 'First counter' })
  const second = screen.getByRole('group', { name: 'Second counter' })

  await first.getByRole('button', { name: 'Increment' }).click()

  await expect.element(first.getByRole('status', { name: 'Count' })).toHaveTextContent('1')

  await expect.element(second.getByRole('status', { name: 'Count' })).toHaveTextContent('0')
})
