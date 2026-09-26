// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noConditionalEmptyObjectSpreadRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'avoid' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-conditional-empty-object-spread', noConditionalEmptyObjectSpreadRule, {
  valid: [
    'const result = { value };',
    'const result = { ...values };',
    'const result = condition ? { value } : {};',
  ],
  invalid: [
    {
      code: 'const result = { ...(value !== undefined ? { value } : {}) };',
      errors: [error],
    },
    {
      code: 'const result = { ...(condition ? {} : { value }) };',
      errors: [error],
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-conditional-empty-object-spread plugin integration', () => {
  it('does not offer a semantics-changing fix', () => {
    expect.hasAssertions()

    expect(noConditionalEmptyObjectSpreadRule.meta).not.toHaveProperty('fixable')
  })

  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-conditional-empty-object-spread)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-conditional-empty-object-spread)')
  })
})
