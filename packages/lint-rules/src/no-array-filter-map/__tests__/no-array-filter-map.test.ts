// Adapted from anti-slop; see src/anti-slop/UPSTREAM.md.
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import { runOxlint as runLint } from '../../test-utils/run-oxlint'
import { rule as noArrayFilterMapRule } from '../rule.ts'

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

const error = { messageId: 'arrayFilterMap' }

// oxlint-disable-next-line vitest/require-hook -- RuleTester registers tests during collection.
tester.run('app/no-array-filter-map', noArrayFilterMapRule, {
  valid: [
    'const users = []; users.values().filter(active).map(email).toArray();',
    'const users = []; users.values().map(email).filter(Boolean).toArray();',
    'Iterator.from(users).filter(active).map(email).toArray();',
    'function collect(users: IteratorObject<User>) { return users.filter(active).map(email).toArray(); }',
    'const users = []; users.flatMap(user => user.active ? [user.email] : []);',
    'const users = []; users.map(email); users.filter(active);',
    'const users = []; users.map(email).map(normalize);',
    'const users = []; users.filter(active).filter(verified);',
    'const custom = { filter() { return this; }, map() {} }; custom.filter(active).map(email);',
    'function collect(unknownReceiver) { return unknownReceiver.filter(active).map(email); }',
    'const users = fetchUsers(); users.filter(active).map(email);',
    'const users = []; function collect(users) { return users.filter(active).map(email); }',
    'let users = []; users = iterator; users.filter(active).map(email);',
    'const users = []; users[method](active).map(email);',
    'const first = second; const second = first; first.filter(active).map(email);',
  ],
  invalid: [
    { code: '[].filter(active).map(email);', errors: [error] },
    {
      code: '[].map(user => user.active ? user.email : undefined).filter(email => email !== undefined);',
      errors: [error],
    },
    { code: 'const users = []; users.map(email).filter(Boolean);', errors: [error] },
    {
      code: 'const users = []; const alias = users; alias.filter(active).map(email);',
      errors: [error],
    },
    {
      code: 'function collect(users: User[]) { return users.filter(active).map(email); }',
      errors: [error],
    },
    {
      code: 'function collect(users: readonly User[]) { return users.map(email).filter(present); }',
      errors: [error],
    },
    {
      code: 'function collect(users: ReadonlyArray<User>) { return users.filter(active).map(email); }',
      errors: [error],
    },
    {
      code: 'function collect(users: Array<User>) { return users.filter(active).map(email); }',
      errors: [error],
    },
    { code: "const users = [] as const; users['filter'](active)['map'](email);", errors: [error] },
    { code: 'const users = []; (users.filter(active)!).map(email);', errors: [error] },
    { code: 'const users = []; users?.filter(active)?.map(email);', errors: [error] },
    { code: 'const users = []; users.slice().filter(active).map(email);', errors: [error] },
    {
      code: 'const users = []; users.filter(active).map(email).filter(Boolean);',
      errors: [error, error],
    },
  ],
})

const fixturesDir = resolve(import.meta.dirname, 'fixtures')

const configPath = resolve(fixturesDir, '.oxlintrc.json')

describe('no-array-filter-map plugin integration', () => {
  it('reports violations through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'violations.ts'))

    expect(exitCode).not.toBe(0)
    expect(stdout).toContain('app(no-array-filter-map)')
  })

  it('accepts clean code through the registered plugin', async () => {
    expect.hasAssertions()

    const { exitCode, stdout } = await runLint(configPath, resolve(fixturesDir, 'clean.ts'))

    expect(exitCode).toBe(0)
    expect(stdout).not.toContain('app(no-array-filter-map)')
  })
})
