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

  it('reports each historical design literal violation at its source location', async () => {
    expect.hasAssertions()

    // Characterize the existing fixture's token policy; these values are not a new policy.
    const expectedDiagnostics = [
      {
        line: 4,
        column: 17,
        message: "Hardcoded color '#F3EBE2'. Use a color token instead.",
      },
      {
        line: 7,
        column: 20,
        message: "Hardcoded color 'rgba(0, 0, 0, 0.5)'. Use a color token instead.",
      },
      {
        line: 10,
        column: 22,
        message: "Hardcoded spacing '16px'. Use a spacing token (xs/sm/md/lg/xl) instead.",
      },
      {
        line: 13,
        column: 18,
        message: "Hardcoded spacing '8px'. Use a spacing token (xs/sm/md/lg/xl) instead.",
      },
      {
        line: 16,
        column: 27,
        message: "Hardcoded radius '12px'. Use a radius token (sm/md/lg/xl/full) instead.",
      },
      {
        line: 19,
        column: 24,
        message: 'Hardcoded shadow literal. Use a shadow token (sm/md/lg) instead.',
      },
      {
        line: 22,
        column: 25,
        message:
          "Hardcoded font-weight '600'. Use a font-weight token (normal/medium/semibold/bold) instead.",
      },
      {
        line: 25,
        column: 25,
        message:
          "Hardcoded line-height '1.5'. Use a line-height token (tight/normal/relaxed) instead.",
      },
      {
        line: 28,
        column: 29,
        message: "Hardcoded spacing '4px'. Use a spacing token (xs/sm/md/lg/xl) instead.",
      },
      {
        line: 28,
        column: 44,
        message: "Hardcoded spacing '32px'. Use a spacing token (xs/sm/md/lg/xl) instead.",
      },
      {
        line: 31,
        column: 20,
        message: "Hardcoded size '20px'. Use a sizing token (2xs/xs/sm/md/lg/xl/2xl/3xl) instead.",
      },
      {
        line: 34,
        column: 21,
        message: 'Hardcoded color in border value. Use borderColor with a color token instead.',
      },
      {
        line: 37,
        column: 26,
        message: "Hardcoded color '#DAD2CA'. Use a color token instead.",
      },
    ]

    const { stdout } = await runOxlint('violations.ts')

    const diagnostics = Array.from(
      stdout.matchAll(
        /violations\.ts:(\d+):(\d+): error app\(no-hardcoded-design-literals\): ([^\n]+)/gu,
      ),
      ([, line, column, message]) => ({ line: Number(line), column: Number(column), message }),
    )

    expect(diagnostics).toHaveLength(expectedDiagnostics.length)
    expect(diagnostics).toEqual(expect.arrayContaining(expectedDiagnostics))
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
