#!/usr/bin/env node
// Run only after the human explicitly approves the pending change.
import { existsSync, renameSync } from 'node:fs'

const id = process.argv[2]

if (!id || !existsSync(`${id}.pending`)) {
  throw new Error('Pass the pending approval path printed by the testing guard.')
}

renameSync(`${id}.pending`, `${id}.approved`)

console.log('Approved the exact pending operation once. Retry it without changes.')
