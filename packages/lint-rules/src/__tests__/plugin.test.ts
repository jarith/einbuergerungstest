import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import plugin from '../plugin.ts'
import { runOxlint } from '../test-utils/run-oxlint'

const configPath = resolve(import.meta.dirname, '../../../../oxlint.config.ts')

const expectedRuleNames = [
  'component-folder-structure',
  'no-array-filter-map',
  'no-atom-in-props',
  'no-chained-type-assertions',
  'no-conditional-jsx-return',
  'no-hardcoded-design-literals',
  'no-inline-types',
  'no-known-value-widening',
  'no-module-mocking',
  'no-object-parameters',
  'no-reduce-accumulator-copy',
  'no-reexport-outside-index',
  'no-reflect-apply',
  'no-reflect-get',
  'no-runtime-typeof',
  'no-shape-in-symbol-names',
  'no-unknown-parameters',
  'no-unknown-returns',
  'no-unknown-type-aliases',
  'no-unsafe-dictionary-type',
  'prefer-array-methods',
  'require-action-for-set',
  'require-safety-comment-for-type-assertion',
]

describe('root custom lint rules', () => {
  it('exports the approved custom rule inventory', () => {
    const result = Object.keys(plugin.rules).toSorted()

    expect(result).toEqual(expectedRuleNames)
  })

  it.each(expectedRuleNames)('enables and runs %s from the TypeScript plugin', async (ruleName) => {
    expect.hasAssertions()

    const fixturesDir = resolve(import.meta.dirname, '..', ruleName, '__tests__/fixtures')

    const { exitCode, stdout, stderr } = await runOxlint(configPath, fixturesDir, [
      '--disable-nested-config',
    ])

    expect(exitCode).toBe(1)
    expect(stderr).toBe('')
    expect(stdout).toContain(`app(${ruleName})`)
  })
})
