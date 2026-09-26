import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-barrel-imports', () => {
  it('reports violations for namespace imports and wildcard re-exports', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-barrel-imports)')
  })

  it('reports exactly 3 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const namespaceViolations = stdout.match(/Namespace imports \(import \* as\) are not allowed/gu)

    const wildcardViolations = stdout.match(
      /Wildcard re-exports \(export \* from\) are not allowed/gu,
    )

    expect(namespaceViolations).toHaveLength(1)
    expect(wildcardViolations).toHaveLength(2)
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-barrel-imports)')
  })
})
