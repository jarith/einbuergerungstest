import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('require-action-for-set', () => {
  it('reports violations for functions setting multiple distinct atoms', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(require-action-for-set)')
  })

  it('reports the expected unbatched multi-atom mutation violation count', async () => {
    expect.hasAssertions()

    const expectedViolationCount = 3

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/must be wrapped in action/gu)
    expect(violations).toHaveLength(expectedViolationCount)
  })

  it.each([
    { scope: 'plain function', expectedLine: 4, expectedColumn: 17 },
    { scope: 'callback', expectedLine: 10, expectedColumn: 17 },
    { scope: 'module', expectedLine: 17, expectedColumn: 1 },
  ])('identifies the unbatched $scope mutation', async ({ expectedLine, expectedColumn }) => {
    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain(
      `violations.ts:${expectedLine}:${expectedColumn}: error app(require-action-for-set)`,
    )
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(require-action-for-set)')
  })
})
