import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-deep-slice-imports', () => {
  it('reports violations for deep slice imports', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-deep-slice-imports)')
  })

  it('reports exactly 4 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/Deep imports from '[^']+' are not allowed/gu)
    expect(violations).toHaveLength(4)
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-deep-slice-imports)')
  })
})
