// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noUnknownTypeAliasesRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'unknownAlias' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-unknown-type-aliases', noUnknownTypeAliasesRule, {
  valid: [
    'type User = { readonly id: string };',
    'type Alias = string; type UserId = Alias;',
    'type Payload = string | number;',
    'type Box<T> = { readonly value: T }; type Payload = Box<unknown>;',
  ],
  invalid: [
    { code: 'type Alias = unknown;', errors: [error] },
    { code: 'type Current = unknown;', errors: [error] },
    { code: 'type UnknownValue = unknown; type Alias = UnknownValue;', errors: [error, error] },
    { code: 'type Payload = string | unknown;', errors: [error] },
    {
      code: 'type Payload = string | unknown; type NestedPayload = number | Payload;',
      errors: [error, error],
    },
    {
      code: 'type Identity<T> = T; type Payload = Identity<unknown>;',
      errors: [error],
    },
    {
      code: 'type Identity<T> = T; type Wrapped<T> = Identity<T>; type Payload = Wrapped<unknown>;',
      errors: [error],
    },
    {
      code: 'function outer() { type Payload = unknown; }',
      errors: [error],
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-unknown-type-aliases plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-unknown-type-aliases)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-unknown-type-aliases)')
  })
})
