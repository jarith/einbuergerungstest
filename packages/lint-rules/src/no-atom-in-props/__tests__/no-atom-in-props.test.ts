import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-atom-in-props', () => {
  it('reports violations for Atom/AtomMut/Computed in Props interfaces', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-atom-in-props)')
  })

  it('reports all expected violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/is not allowed in Props interfaces/gu)
    expect(violations).toHaveLength(3)
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-atom-in-props)')
  })
})
