import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-conditional-jsx-return', () => {
  it('reports violations for conditional JSX returns', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.tsx')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-conditional-jsx-return)')
    expect(stdout).toContain('Conditional JSX return is not allowed')
  })

  it('reports exactly 8 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.tsx')

    const violations = stdout.match(/Conditional JSX return is not allowed/gu)

    expect(violations).toHaveLength(8)
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.tsx')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-conditional-jsx-return)')
    expect(stdout).not.toContain('Conditional JSX return is not allowed')
  })
})
