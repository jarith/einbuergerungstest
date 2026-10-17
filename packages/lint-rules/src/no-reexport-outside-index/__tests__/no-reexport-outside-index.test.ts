import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-reexport-outside-index', () => {
  it('reports violations for re-exports in non-index files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-reexport-outside-index)')
  })

  it('reports each non-index re-export at its source location', async () => {
    expect.hasAssertions()

    const expectedMessage =
      'Re-exports are only allowed in index files. Move this re-export to an index file or use a direct export instead.'

    const expectedDiagnostics = [
      { line: 4, column: 1, message: expectedMessage },
      { line: 5, column: 1, message: expectedMessage },
      { line: 6, column: 1, message: expectedMessage },
      { line: 9, column: 1, message: expectedMessage },
      { line: 12, column: 1, message: expectedMessage },
      { line: 13, column: 1, message: expectedMessage },
      { line: 18, column: 1, message: expectedMessage },
      { line: 19, column: 1, message: expectedMessage },
    ]

    const { stdout } = await runOxlint('violations.ts')

    const diagnostics = Array.from(
      stdout.matchAll(
        /violations\.ts:(\d+):(\d+): error app\(no-reexport-outside-index\): ([^\n]+)/gu,
      ),
      ([, line, column, message]) => ({ line: Number(line), column: Number(column), message }),
    )

    expect(diagnostics).toHaveLength(expectedDiagnostics.length)
    expect(diagnostics).toEqual(expect.arrayContaining(expectedDiagnostics))
  })

  it('does not report violations for clean local exports', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-reexport-outside-index)')
  })

  it('allows re-exports in index files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('index.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-reexport-outside-index)')
  })

  it('forbids parent re-exports in index files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('index-parent-reexports/index.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-reexport-outside-index)')
  })

  it('reports only parent re-exports at their source locations in an index file', async () => {
    expect.hasAssertions()

    const expectedMessage =
      'Index files must not re-export from parent directories. Import from a sibling module instead.'

    const expectedDiagnostics = [
      { line: 4, column: 1, message: expectedMessage },
      { line: 5, column: 1, message: expectedMessage },
      { line: 6, column: 1, message: expectedMessage },
      { line: 7, column: 1, message: expectedMessage },
      { line: 8, column: 1, message: expectedMessage },
      { line: 9, column: 1, message: expectedMessage },
      { line: 14, column: 1, message: expectedMessage },
      { line: 15, column: 1, message: expectedMessage },
    ]

    const { stdout } = await runOxlint('index-parent-reexports/index.ts')

    const diagnostics = Array.from(
      stdout.matchAll(/index\.ts:(\d+):(\d+): error app\(no-reexport-outside-index\): ([^\n]+)/gu),
      ([, line, column, message]) => ({ line: Number(line), column: Number(column), message }),
    )

    expect(diagnostics).toHaveLength(expectedDiagnostics.length)
    expect(diagnostics).toEqual(expect.arrayContaining(expectedDiagnostics))
  })
})
