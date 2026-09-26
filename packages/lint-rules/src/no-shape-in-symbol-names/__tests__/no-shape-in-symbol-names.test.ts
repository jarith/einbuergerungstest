// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noForbiddenTermInSymbolNamesRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'forbiddenSymbolName' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-shape-in-symbol-names', noForbiddenTermInSymbolNamesRule, {
  valid: [
    'declare const schema: ExternalSchema; const field = schema.shape.id;',
    'declare const outer: External; const value = outer.inner.shape;',
    "declare const schema: ExternalSchema; schema.shape.id.parse('x');",
    'const owner = { id: 1 }; const value = owner.id;',
  ],
  invalid: [
    { code: 'const shape = 1;', errors: [error] },
    { code: 'function shapeOf() {}', errors: [error] },
    { code: 'type PayloadShape = { id: string };', errors: [error] },
    { code: 'type Payload = { shape: string };', errors: [error] },
    {
      code: "declare const owner: External; const shape = 'field'; const value = owner[shape];",
      errors: 2,
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-shape-in-symbol-names plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-shape-in-symbol-names)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-shape-in-symbol-names)')
  })
})
