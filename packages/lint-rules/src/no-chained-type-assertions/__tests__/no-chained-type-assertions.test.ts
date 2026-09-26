// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noChainedTypeAssertionsRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'chained' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-chained-type-assertions', noChainedTypeAssertionsRule, {
  valid: [
    'const value = input as User;',
    'const value = (input as User);',
    'const value = ({ id: 1 } as const) as const;',
  ],
  invalid: [
    { name: 'as chain', code: 'const value = input as unknown as User;', errors: [error] },
    {
      name: 'parenthesized chain',
      code: 'const value = (input as unknown) as User;',
      errors: [error],
    },
    {
      name: 'angle-bracket chain',
      code: 'const value = <User>(<unknown>input);',
      errors: [error],
    },
    {
      name: 'mixed const chain',
      code: 'const value = ({ id: 1 } as const) as User;',
      errors: [error],
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-chained-type-assertions plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-chained-type-assertions)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-chained-type-assertions)')
  })
})
