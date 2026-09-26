// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noUnknownReturnsRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'unknownReturn' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-unknown-returns', noUnknownReturnsRule, {
  valid: [
    'type ImportedValue = unknown;',
    'function parse(): ImportedValue { return input; }',
    'function parse(): User { return user; }',
    'function infer() { return input; }',
    'function generic<Value>(): Value { return value; }',
    'type Value = unknown; function generic<Value>(): Value { return value; }',
    'type Key = unknown; type Mapped<Input> = { [Key in keyof Input]: () => Key };',
    'type Item = unknown; type Unpacked<Input> = Input extends Promise<infer Item> ? () => Item : never;',
    'function cause(): { cause: unknown } { return { cause: input }; }',
    'type Result = { value: unknown }; function load(): Result { return result; }',
    'function load(): Promise<User> { return promise; }',
    'type Identity<T> = T; function load(): Identity<User> { return user; }',
    'type Value = unknown; function outer() { type Value = User; function load(): Value { return user; } }',
  ],
  invalid: [
    { code: 'function load(): unknown { return input; }', errors: [error] },
    { code: 'const load = (): unknown => input;', errors: [error] },
    { code: 'type Loader = () => unknown;', errors: [error] },
    { code: 'interface Loader { load(): unknown }', errors: [error] },
    { code: 'declare function load(): unknown;', errors: [error] },
    { code: 'function load(): string | unknown { return input; }', errors: [error] },
    { code: 'function load(): Promise<unknown> { return promise; }', errors: [error] },
    {
      code: 'type UnknownValue = unknown; function load(): UnknownValue { return input; }',
      errors: [error],
    },
    {
      code: 'type Item = unknown; type Fallback<Input> = Input extends infer Item ? string : () => Item;',
      errors: [error],
    },
    {
      code: 'function outer() { type Result = unknown; function load(): Result { return input; } }',
      errors: [error],
    },
    {
      code: 'type Identity<T> = T; function load(): Identity<unknown> { return input; }',
      errors: [error],
    },
    {
      code: 'type Identity<T> = T; type Wrapped<T> = Promise<Identity<T>>; function load(): Wrapped<unknown> { return promise; }',
      errors: [error],
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-unknown-returns plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-unknown-returns)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-unknown-returns)')
  })
})
