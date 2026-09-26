// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noReduceAccumulatorCopyRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'accumulatorCopy' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-reduce-accumulator-copy', noReduceAccumulatorCopyRule, {
  valid: [
    'items.reduce((acc, item) => { acc.push(item); return acc; }, []);',
    'items.reduce((acc, item) => Object.assign(acc, item), {});',
    'items.reduce((acc, item) => Object.assign(acc, acc, item), {});',
    'items.reduce((acc, item) => { acc[item.id] = { ...item }; return acc; }, {});',
    'items.reduce((acc, item) => { acc.push(Object.assign({}, item)); return acc; }, []);',
    'items.reduce((acc, item) => { acc.push(item.slice()); return acc; }, []);',
    "items.reduce((acc, item) => acc.concat(item), '');",
    'items.reduce((acc, item) => acc.concat(item), customCollection);',
    'function copy(acc) { return Object.assign({}, acc); }',
    'items.map((acc, item) => Object.assign({}, acc));',
    'items.reduce((acc, item) => { function copy(acc) { return Object.assign({}, acc); } return acc; }, {});',
    'items.reduce((acc, item) => { const snapshot = () => Object.assign({}, acc); return acc; }, {});',
    'items.reduce((acc, item) => { { const acc = {}; Object.assign({}, acc); } return acc; }, {});',
    'const Object = custom; items.reduce((acc, item) => Object.assign({}, acc), {});',
    'function run(Object) { return items.reduce((acc, item) => Object.assign({}, acc), {}); }',
    'const Array = custom; items.reduce((acc, item) => Array.from(acc), []);',
    'items.reduce((acc, item) => { let alias = acc; alias = item; return Object.assign({}, alias); }, {});',
    // Owned by the native rule.
    'items.reduce((acc, item) => [...acc, item], []);',
    'items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});',
  ],
  invalid: [
    {
      code: 'items.reduce((acc, item) => Object.assign({}, acc, { [item.id]: item }), {});',
      errors: [error],
    },
    {
      code: 'items.reduceRight((acc, item) => Object.assign({}, acc, item), {});',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item, index, array) => Object.assign({}, acc, item), {});',
      errors: [error],
    },
    { code: 'items.reduce(acc => Object.assign({}, acc), {});', errors: [error] },
    {
      code: 'items.reduce(function (acc, item) { return Object.assign({}, item, acc); }, {});',
      errors: [error],
    },
    {
      code: "items['reduce'](((acc, item) => Object['assign']({}, acc, item)), {});",
      errors: [error],
    },
    {
      code: 'items.reduce((acc = {}, item) => Object.assign({}, acc, item), {});',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => { const alias = acc; return Object.assign({}, alias, item); }, {});',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => Object.assign({}, acc as State, item), {});',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => { const next = Object.assign({}, acc); next[item.id] = item; return next; }, {});',
      errors: [error],
    },
    { code: 'items.reduce((acc, item) => acc.concat([item]), []);', errors: [error] },
    {
      code: "items.reduceRight((acc, item, index) => acc['concat']([item]), [] as Item[]);",
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => { const next = acc.slice(); next.push(item); return next; }, []);',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => { const alias = acc; return alias.concat(item); }, []);',
      errors: [error],
    },
    {
      code: 'const initial = []; items.reduce((acc, item) => acc.concat(item), initial);',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => { const next = Array.from(acc); next.push(item); return next; }, []);',
      errors: [error],
    },
    {
      code: 'items.reduce((acc, item) => acc.toSpliced(acc.length, 0, item), []);',
      errors: [error],
    },
    { code: 'items.reduce((acc, item) => acc.toSorted(), []);', errors: [error] },
    { code: 'items.reduce((acc, item) => acc.toReversed(), []);', errors: [error] },
    { code: 'items.reduce((acc, item) => acc.with(0, item), []);', errors: [error] },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-reduce-accumulator-copy plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-reduce-accumulator-copy)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-reduce-accumulator-copy)')
  })
})
