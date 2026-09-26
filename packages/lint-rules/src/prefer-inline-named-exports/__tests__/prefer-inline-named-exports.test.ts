import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('prefer-inline-named-exports', () => {
  it('reports violations for local export lists', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(prefer-inline-named-exports)')
  })

  it('reports exactly 5 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(
      /Use inline named exports\. Prefer `export const Foo = \.\.\.` over declaring locally and exporting later\./gu,
    )

    expect(violations).toHaveLength(5)
  })

  it('does not report violations for clean exports', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(prefer-inline-named-exports)')
  })
})
