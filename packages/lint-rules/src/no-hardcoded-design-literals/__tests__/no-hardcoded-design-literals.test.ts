import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-hardcoded-design-literals', () => {
  it('reports violations for hardcoded design literals', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-hardcoded-design-literals)')
  })

  it('reports exactly 13 violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const violations = stdout.match(/Hardcoded /gu)
    expect(violations).toHaveLength(13)
  })

  it('catches hex color literals', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain("Hardcoded color '#F3EBE2'")
    expect(stdout).toContain("Hardcoded color '#DAD2CA'")
  })

  it('catches rgb color literals', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain("Hardcoded color 'rgba(0, 0, 0, 0.5)'")
  })

  it('catches spacing token px values', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain("Hardcoded spacing '16px'")
    expect(stdout).toContain("Hardcoded spacing '8px'")
  })

  it('catches radius token px values', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain("Hardcoded radius '12px'")
  })

  it('catches raw shadow literals', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain('Hardcoded shadow literal')
  })

  it('catches font-weight and line-height literals', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain("Hardcoded font-weight '600'")
    expect(stdout).toContain("Hardcoded line-height '1.5'")
  })

  it('catches violations in responsive objects', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain("Hardcoded spacing '4px'")
    expect(stdout).toContain("Hardcoded spacing '32px'")
  })

  it('catches hex colors in border shorthand', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    expect(stdout).toContain('Hardcoded color in border value')
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-hardcoded-design-literals)')
  })
})
