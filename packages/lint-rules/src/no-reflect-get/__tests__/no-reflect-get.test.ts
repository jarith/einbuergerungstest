// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noReflectGetRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'reflectGet' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-reflect-get', noReflectGetRule, {
  valid: [
    'const value = owner.property;',
    'const value = owner[key];',
    'Reflect.set(owner, key, value);',
    'const Reflect = { get() { return 1; } }; Reflect.get();',
    'function read(Reflect: { get(): number }) { return Reflect.get(); }',
  ],
  invalid: [
    { name: 'static access', code: 'const value = Reflect.get(owner, key);', errors: [error] },
    { name: 'computed access', code: "const value = Reflect['get'](owner, key);", errors: [error] },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-reflect-get plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-reflect-get)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-reflect-get)')
  })
})
