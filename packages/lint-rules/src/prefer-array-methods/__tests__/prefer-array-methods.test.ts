import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('prefer-array-methods', () => {
  it('reports violations for imperative loop patterns', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(prefer-array-methods)')
  })

  it('reports the expected imperative collection loop violation count', async () => {
    expect.hasAssertions()

    const expectedViolationCount = 7

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/Prefer declarative methods/gu)
    expect(violations).toHaveLength(expectedViolationCount)
  })

  it.each([
    { pattern: 'indexed push', expectedLine: 6 },
    { pattern: 'for-of push', expectedLine: 14 },
    { pattern: 'conditional push', expectedLine: 22 },
    { pattern: 'object assignment', expectedLine: 32 },
    { pattern: 'Map insertion', expectedLine: 40 },
    { pattern: 'Set insertion', expectedLine: 48 },
    { pattern: 'unshift', expectedLine: 56 },
  ])('identifies the $pattern loop', async ({ expectedLine }) => {
    const expectedColumn = 3

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain(
      `violations.ts:${expectedLine}:${expectedColumn}: error app(prefer-array-methods)`,
    )
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(prefer-array-methods)')
  })
})
