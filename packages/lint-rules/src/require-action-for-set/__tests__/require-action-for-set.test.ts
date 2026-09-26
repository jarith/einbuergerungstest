import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('require-action-for-set', () => {
  it('reports violations for functions with 2+ distinct atom .set() calls', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(require-action-for-set)')
  })

  it('reports exactly 3 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/must be wrapped in action/gu)
    expect(violations).toHaveLength(3)
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(require-action-for-set)')
  })
})
