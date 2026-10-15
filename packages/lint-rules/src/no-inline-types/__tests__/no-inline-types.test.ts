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

    const expectedParameterViolationCount = 5
    const expectedReturnViolationCount = 2

    const expectedViolations = [
      'violations.ts:4:30: error app(no-inline-types): Inline object type in parameter',
      'violations.ts:7:31: error app(no-inline-types): Inline object type in parameter',
      'violations.ts:12:31: error app(no-inline-types): Inline object type in return type',
      'violations.ts:15:35: error app(no-inline-types): Inline object type in parameter',
      'violations.ts:18:32: error app(no-inline-types): Inline object type in parameter',
      'violations.ts:21:35: error app(no-inline-types): Inline object type in return type',
      'violations.ts:24:19: error app(no-inline-types): Inline object type in parameter',
    ]

    const { stdout } = await runOxlint('violations.ts')

    const paramViolations = stdout.match(/Inline object type in parameter/gu)
    const returnViolations = stdout.match(/Inline object type in return type/gu)

    const violations = stdout.match(
      /violations\.ts:\d+:\d+: error app\(no-inline-types\): Inline object type in (?:parameter|return type)/gu,
    )

    expect(paramViolations).toHaveLength(expectedParameterViolationCount)
    expect(returnViolations).toHaveLength(expectedReturnViolationCount)
    expect(violations).toEqual(expect.arrayContaining(expectedViolations))
  })

  it('does not report violations for clean code', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runOxlint('clean.ts')

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-inline-types)')
    expect(stdout).not.toContain('Inline object type')
  })
})
