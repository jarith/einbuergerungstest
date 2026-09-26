// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noUnknownParametersRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'unknownParameter' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-unknown-parameters', noUnknownParametersRule, {
  valid: [
    'function enrich(cause: unknown): void {}',
    'function enrich(cause: Error | unknown): void {}',
    'function isString(value: unknown): value is string { return true; }',
    'const isString = (value: unknown): value is string => true;',
    'function assertString(value: unknown): asserts value is string {}',
    'type Guard = (value: unknown) => value is string;',
    'declare function isString(value: unknown): value is string;',
    'type Guards = { isString(value: unknown): value is string };',
    'function parse(value: string | number): void {}',
  ],
  invalid: [
    { code: 'function parse(value: unknown): void {}', errors: [error] },
    { code: 'function parse(value: string | unknown): void {}', errors: [error] },
    {
      code: 'function parse(value: string | (number | unknown)): void {}',
      errors: [error],
    },
    {
      code: 'function isString(value: unknown, context: unknown): value is string { return true; }',
      errors: [{ ...error, data: { parameter: 'context' } }],
    },
    {
      code: 'export function parse({ value }: unknown = {}): void {}',
      errors: [{ ...error, data: { parameter: '{ value }' } }],
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-unknown-parameters plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-unknown-parameters)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-unknown-parameters)')
  })
})
