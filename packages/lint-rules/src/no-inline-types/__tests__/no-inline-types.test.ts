import { expect, describe, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

const runOxlint = (file: string) => runLint(configPath, resolve(fixturesDir, file))

describe('no-inline-types', () => {
  it('reports violations for inline object types in function params and return types', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('violations.ts')

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-inline-types)')
    expect(stdout).toContain('Inline object type in parameter')
    expect(stdout).toContain('Inline object type in return type')
  })

  it('reports all expected violations', async () => {
    expect.hasAssertions()

    const { stdout } = await runOxlint('violations.ts')

    const paramViolations = stdout.match(/Inline object type in parameter/gu)
    const returnViolations = stdout.match(/Inline object type in return type/gu)

    // violations.ts has: arrowInlineParam, fnDeclInlineParam, destructuredParam,
    // genericParam, FnType = 5 param violations
    expect(paramViolations).toHaveLength(5)

    // violations.ts has: arrowInlineReturn, genericReturn = 2 return violations
    expect(returnViolations).toHaveLength(2)
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-inline-types)')
    expect(stdout).not.toContain('Inline object type')
  })
})
