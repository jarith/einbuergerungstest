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

  it('reports each conditional JSX return at its source location', async () => {
    expect.hasAssertions()

    const expectedMessage =
      'Conditional JSX return is not allowed. Use explicit if statements with early returns instead.'

    const expectedDiagnostics = [
      { line: 4, column: 18, message: expectedMessage },
      { line: 7, column: 17, message: expectedMessage },
      { line: 10, column: 17, message: expectedMessage },
      { line: 13, column: 17, message: expectedMessage },
      { line: 17, column: 10, message: expectedMessage },
      { line: 22, column: 10, message: expectedMessage },
      { line: 26, column: 18, message: expectedMessage },
      { line: 29, column: 18, message: expectedMessage },
    ]

    const { stdout } = await runOxlint('violations.tsx')

    const diagnostics = Array.from(
      stdout.matchAll(
        /violations\.tsx:(\d+):(\d+): error app\(no-conditional-jsx-return\): ([^\n]+)/gu,
      ),
      ([, line, column, message]) => ({ line: Number(line), column: Number(column), message }),
    )

    expect(diagnostics).toHaveLength(expectedDiagnostics.length)
    expect(diagnostics).toEqual(expect.arrayContaining(expectedDiagnostics))
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.tsx')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-conditional-jsx-return)')
    expect(stdout).not.toContain('Conditional JSX return is not allowed')
  })
})
