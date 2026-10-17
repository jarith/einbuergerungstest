#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process'
// Codex hooks record file and command evidence for the testing rule engines.
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  unlinkSync,
  appendFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const input = JSON.parse(readFileSync(0, 'utf8') || '{}')

const cwd = root(input.cwd || process.cwd())

if (!process.env.CODEX_PROJECT_DIR) {
  try {
    process.env.CODEX_PROJECT_DIR = execFileSync('git', ['worktree', 'list', '--porcelain'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')[0]
      .replace(/^worktree /, '')
  } catch {}
}

const config = [cwd, process.env.CODEX_PROJECT_DIR]
  .filter(Boolean)
  .map((p) => join(p, '.codex/testing.json'))
  .find(existsSync)

if (!config) {
  process.exit(0)
}
const stateDir = join(tmpdir(), 'codex-testing', hash(cwd), hash(input.session_id || 'manual'))

mkdirSync(stateDir, { recursive: true })

const evidence = join(stateDir, 'events.jsonl')

const event = input.hook_event_name

const command = String(input.tool_input?.command || '')

const patch = input.tool_name === 'apply_patch'

const edits = patch ? patchEdits(command) : []

const engineInput = { ...input, cwd }

if (event === 'PreToolUse') {
  const checks = patch ? edits : input.tool_name === 'Bash' ? [{ command }] : []
  const id = hash(JSON.stringify({ cwd, tool: input.tool_name, command }))
  const approval = join(stateDir, `${id}.approved`)
  const approved = existsSync(approval)

  for (const check of checks) {
    const result = run('guard', check)

    if (result.status !== 0) {
      throw new Error(result.stderr || 'guard failed')
    }
    const decision = JSON.parse(result.stdout || '{}')

    if (!decision.action) {
      continue
    }

    if (decision.action === 'approval') {
      if (approved) {
        continue
      }

      writeFileSync(join(stateDir, `${id}.pending`), command)

      decision.reason += ` Codex cannot prompt from this hook. Ask the human to approve this exact change; after explicit approval run: node ${JSON.stringify(join(here, 'approve.mjs'))} ${JSON.stringify(join(stateDir, id))}. Then retry the unchanged operation. Never approve your own change.`
    }

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: event,
          permissionDecision: 'deny',
          permissionDecisionReason: decision.reason,
        },
      }),
    )

    process.exit(0)
  }

  if (approved) {
    unlinkSync(approval)
  }

  // Keep validation answers and previous runs out of the evaluation context.
  if (!patch && /(?:docs\/validation|reports\/agent-runs)/.test(command)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: event,
          permissionDecision: 'deny',
          permissionDecisionReason:
            'testing: do not read validation answers or previous agent runs.',
        },
      }),
    )
  }
} else if (event === 'PostToolUse') {
  const changed = edits.map((e) => e.filePath)
  // Shell writes do not expose paths. Compare content fingerprints before/after each
  // completed command, so shell-created tests receive the same lint and stop checks.
  const snapshotPath = join(stateDir, 'files.json')
  const previous = existsSync(snapshotPath) ? JSON.parse(readFileSync(snapshotPath, 'utf8')) : {}
  const current = fingerprints(cwd)

  for (const [path, digest] of Object.entries(current)) {
    if (previous[path] !== digest) {
      changed.push(join(cwd, path))
    }
  }

  writeFileSync(snapshotPath, JSON.stringify(current))

  appendFileSync(
    evidence,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      changedFiles: [...new Set(changed)],
      commands: input.tool_name === 'Bash' ? [command] : [],
    }) + '\n',
  )

  let blocked = false
  const warnings = []

  for (const filePath of new Set(changed)) {
    const result = run('test-lint', { cwd, filePath })

    if (result.status === 2) {
      process.stderr.write(result.stderr)

      blocked = true
    } else if (result.status !== 0) {
      throw new Error(result.stderr || 'test lint failed')
    }
    const context = JSON.parse(result.stdout || '{}').hookSpecificOutput?.additionalContext

    if (context) {
      warnings.push(context)
    }
  }

  if (blocked) {
    process.exit(2)
  }

  if (warnings.length) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: event, additionalContext: warnings.join('\n') },
      }),
    )
  }
} else if (event === 'Stop') {
  if (!existsSync(evidence)) {
    process.exit(0)
  }

  appendFileSync(
    evidence,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      finalMessage: input.last_assistant_message || '',
    }) + '\n',
  )

  const result = run('stop-check', {
    ...engineInput,
    evidencePath: evidence,
    session_id: hash(cwd + input.session_id),
  })

  process.stdout.write(result.stdout)

  process.stderr.write(result.stderr)

  process.exit(result.status ?? 1)
} else if (event === 'SessionStart') {
  writeFileSync(join(stateDir, 'files.json'), JSON.stringify(fingerprints(cwd)))
}

function run(name, payload) {
  const result = spawnSync(process.execPath, [join(here, `${name}.mjs`)], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: process.env,
  })

  if (result.error) {
    throw result.error
  }

  return result
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function root(path) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: path,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return path
  }
}

function patchEdits(text) {
  const files = []
  let current

  for (const line of text.split('\n')) {
    const header = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/)
    const moved = line.match(/^\*\*\* Move to: (.+)$/)

    if (header || moved) {
      current = { filePath: resolve(input.cwd || cwd, (header || moved)[1]), addedText: '' }

      files.push(current)
    } else if (current && line.startsWith('+')) {
      current.addedText += line.slice(1) + '\n'
    }
  }

  return files
}

function fingerprints(dir) {
  let paths
  try {
    paths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: dir,
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean)
  } catch {
    paths = readdirSync(dir, { recursive: true }).map(String)
  }
  const files = {}

  for (const path of paths) {
    if (
      !/\.[cm]?[jt]sx?$/.test(path) ||
      /(^|\/)(node_modules|\.codex|\.agents|reports)\//.test(path)
    ) {
      continue
    }
    try {
      files[relative(dir, join(dir, path))] = hash(readFileSync(join(dir, path)))
    } catch {}
  }

  return files
}
