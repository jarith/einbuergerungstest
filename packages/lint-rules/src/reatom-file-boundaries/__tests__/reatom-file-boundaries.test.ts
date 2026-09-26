import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('reatom-file-boundaries', () => {
  it('reports violations for reatomRoute() in non-route files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(reatom-file-boundaries)')
    expect(stdout).toContain('reatomRoute() calls are only allowed in *.route.ts(x) files.')
  })

  it('reports all expected violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/reatomRoute\(\) calls are only allowed/gu)
    expect(violations).toHaveLength(2)
  })

  it('does not report violations in *.route.ts files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.route.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(reatom-file-boundaries)')
  })

  it('does not report violations in *.route.tsx files', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.route.tsx')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(reatom-file-boundaries)')
  })
})
