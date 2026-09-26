import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('component-folder-structure', () => {
  it('reports flat component files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'violations/packages/web/src/pages/dashboard/ui/dashboard.tsx',
    )

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(component-folder-structure)')
    expect(stdout).toContain('must live at "/<component-name>/<component-name>.tsx"')
  })

  it('reports missing sibling styles files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'violations/packages/web/src/pages/dashboard/ui/habit-card/habit-card.tsx',
    )

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(component-folder-structure)')
    expect(stdout).toContain('must have a sibling "habit-card.styles.ts" file')
  })

  it('reports tests outside a tests subfolder', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'violations/packages/web/src/pages/dashboard/ui/calendar-cell/calendar-cell.test.tsx',
    )

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(component-folder-structure)')
    expect(stdout).toContain('Component tests must live in a "tests/" subfolder')
  })

  it('accepts a valid web component folder', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'clean/packages/web/src/pages/dashboard/ui/dashboard/dashboard.tsx',
    )

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(component-folder-structure)')
  })

  it('accepts a valid design-system component folder', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'clean/packages/design-system/src/components/button/button.tsx',
    )

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(component-folder-structure)')
  })

  it('accepts browser parity tests under a component tests folder', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'clean/packages/web/src/pages/dashboard/ui/calendar-grid/tests/calendar-grid.browser.test.tsx',
    )

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(component-folder-structure)')
  })

  it('ignores non-component tests outside ui component folders', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint(
      'clean/packages/web/src/pages/dashboard/model/calendar-ui.model.test.ts',
    )

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(component-folder-structure)')
  })

  it('ignores route and main entry files', async () => {
    expect.hasAssertions()

    const routeResult = await runOxlint(
      'clean/packages/web/src/pages/dashboard/dashboard.route.tsx',
    )

    const mainResult = await runOxlint('clean/packages/web/src/main.tsx')

    expect(routeResult.exitCode).toBe(0)
    expect(routeResult.stdout).not.toContain('app(component-folder-structure)')
    expect(mainResult.exitCode).toBe(0)
    expect(mainResult.stdout).not.toContain('app(component-folder-structure)')
  })
})
