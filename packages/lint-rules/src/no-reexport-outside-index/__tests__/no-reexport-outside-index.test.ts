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

  it('reports exactly 8 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const matches = stdout.match(/Re-exports are only allowed in index files/gu)
    expect(matches).toHaveLength(8)
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

  it('reports exactly 8 parent re-export violations in index file', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('index-parent-reexports/index.ts')

    const matches = stdout.match(/Index files must not re-export from parent directories/gu)
    expect(matches).toHaveLength(8)
  })
})
