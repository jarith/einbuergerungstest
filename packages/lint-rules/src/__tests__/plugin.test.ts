import { describe, expect, it } from 'vitest'

import { resolve } from 'node:path'

import plugin from '../plugin.ts'
import { runOxlint } from '../test-utils/run-oxlint'

const configPath = resolve(import.meta.dirname, '../../../../oxlint.config.ts')

const ruleNames = Object.keys(plugin.rules ?? {})

describe('root custom lint rules', () => {
  it.each(ruleNames)('enables and runs %s from the TypeScript plugin', async (ruleName) => {
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
