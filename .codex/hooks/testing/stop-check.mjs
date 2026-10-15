#!/usr/bin/env node
// testing — Stop hook.
// Check full-suite and mutation evidence after tests or logic change.
// Block at most twice per session so reminders cannot loop indefinitely.

import { execSync } from 'node:child_process'
import { readFileSync, existsSync, statSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const input = JSON.parse(readStdin() || '{}')

// Loop guard: at most two blocks per session (1: full run / mutation run; 2: verdicts on survivors).
// `stop_hook_active` alone is too coarse — it is true for every Stop after the first block, so the
// second demand could never fire.
const MAX_BLOCKS = 2

const counterPath = join(
  tmpdir(),
  `testing-stop-${String(input.session_id || 'nosession').replace(/\W/g, '')}`,
)

let blocksSoFar = 0
try {
  blocksSoFar = Number(readFileSync(counterPath, 'utf8')) || 0
} catch {}

if (blocksSoFar >= MAX_BLOCKS) {
  process.exit(0)
}

// Worktree-aware roots. `cwd` follows the Codex working directory (it is the worktree, and moves on `cd`); CODEX_PROJECT_DIR stays
// on the main checkout. Everything about *files* is resolved against the git toplevel of cwd; the harness
// config is per project, so it may fall back to the main checkout when the worktree has no copy.
const cwd = gitToplevel(input.cwd || process.cwd())

const projectDir = process.env.CODEX_PROJECT_DIR || cwd

const cfgPath = [
  join(cwd, '.codex', 'testing.json'),
  join(projectDir, '.codex', 'testing.json'),
].find((p) => existsSync(p))

const cfg = cfgPath ? JSON.parse(readFileSync(cfgPath, 'utf8')) : {}

const fullRun = cfg.commands?.testAll || 'npm test'

const mutationRun =
  cfg.commands?.mutation ||
  (existsSync(join(cwd, 'stryker.config.json')) ||
  existsSync(join(cwd, 'stryker.config.mjs')) ||
  existsSync(join(cwd, 'stryker.conf.json'))
    ? 'npm run test:mutation'
    : null)

// Evidence contains only changes and commands recorded for this Codex session.
let changed = []

const commands = []

let evidenceOk = false

let sessionStart = 0

let lastAssistantText = ''
try {
  const lines = readFileSync(input.evidencePath, 'utf8').split('\n').filter(Boolean)
  evidenceOk = true
  const edited = new Set()

  for (const line of lines) {
    try {
      const event = JSON.parse(line)

      if (!sessionStart && event.timestamp) {
        sessionStart = Date.parse(event.timestamp) || 0
      }

      if (event.finalMessage?.trim()) {
        lastAssistantText = event.finalMessage
      }

      for (const file of event.changedFiles || []) {
        if (file.startsWith(cwd + '/')) {
          edited.add(file.slice(cwd.length + 1))
        }
      }

      // Runs before the first edit or in another worktree do not verify this work.
      if (edited.size) {
        commands.push(...(event.commands || []))
      }
    } catch {}
  }
  changed = [...edited]
} catch {}

if (!evidenceOk) {
  try {
    changed = execSync('git status --porcelain -uall', { cwd, encoding: 'utf8' })
      .split('\n')
      .map((l) => l.slice(3).trim())
      .filter(Boolean)
  } catch {
    process.exit(0)
  }
}
const changedTests = changed.filter((f) => /\.(test|spec)\.[cm]?[jt]sx?$|__tests__\//.test(f))

const changedLogic = changed.filter(
  (f) =>
    /\.[cm]?[jt]sx?$/.test(f) &&
    !/\.(test|spec)\./.test(f) &&
    !/__tests__\//.test(f) &&
    !/\.config\./.test(f),
)

if (!changedTests.length && !changedLogic.length) {
  process.exit(0)
}

const ranFull = commands.some(
  (c) =>
    (/\b(vitest\s+run|vitest)\b(?![^\n]*\s\S*\.(test|spec)\.)/.test(c) &&
      !/\s--?(t|testNamePattern)\b/.test(c)) ||
    new RegExp(escapeRe(fullRun)).test(c) ||
    /\bnpm\s+test\s*$/.test(c.trim()) ||
    /\bnpm\s+test\s*&&/.test(c),
)

const ranMutation = mutationRun
  ? commands.some((c) => /stryker/.test(c) || new RegExp(escapeRe(mutationRun)).test(c))
  : true

const reasons = []

if ((changedTests.length || changedLogic.length) && !ranFull) {
  reasons.push(
    `Run the WHOLE suite with parallelism and random order before finishing: \`${fullRun}\`. A green run of the files you touched is not verification. Changed: ${[...changedTests, ...changedLogic].slice(0, 8).join(', ')}${changed.length > 8 ? ', …' : ''}.`,
  )
}
const lite = cfg.mode !== 'strict' // standard (default) = full-run reminder only; strict = + mutation + self-review

const mutationDue =
  !lite &&
  (changedLogic.length || changedTests.length) &&
  mutationRun &&
  !ranMutation &&
  (cfg.mutation?.required ?? true)

if (mutationDue) {
  reasons.push(
    `${changedLogic.length ? `Logic files changed (${changedLogic.slice(0, 5).join(', ')})` : `Tests were added or changed (${changedTests.slice(0, 5).join(', ')}) — a test that kills no mutants verifies nothing`}. Run mutation testing on the covered logic (\`${mutationRun}\`, or scoped: \`npx stryker run --mutate <file>\`) and classify survivors: test gap → add the boundary test; equivalent → exclude point-wise with a reason. Do not reason about mutants yourself — run the tool.`,
  )
}

// Strict mode requires a verdict for each surviving mutant in the fresh report.
if (!lite && ranMutation) {
  const survivors = unclassifiedSurvivors(cwd, cfg, sessionStart, lastAssistantText)

  if (survivors.length) {
    reasons.push(
      `The mutation report still has ${survivors.length} surviving mutant(s) you did not give a verdict on${survivors.length > 12 ? ' (first 12)' : ''}:\n` +
        survivors
          .slice(0, 12)
          .map((s) => `     ${s.file}:${s.line} ${s.mutator} → ${s.replacement}`)
          .join('\n') +
        `\n   For each one, in your final message: TEST GAP (boundary is in the task) → add the test on that exact boundary and re-run; IMPLEMENTATION BOUNDARY (a limit or default nobody asked for) → do not bless it, list it under your decisions; EQUIVALENT (no input can make the outputs differ) → say why; the point-wise \`// Stryker disable next-line\` exclusion is proposed to a human, not applied by you. A threshold, date or default that is in the task is never an implementation boundary — it is a test gap. Never lower the threshold (AGENTS.md §8).`,
    )
  }
}

// The self-review checklist never blocks on its own; it rides along with a real blocker.
if (reasons.length && changedTests.length && !lite) {
  reasons.push(
    'Then, for every test you touched: does the name say the same thing as its expects? Is anything mocked that the test was supposed to exercise? List the decisions you made on your own.',
  )
}

if (reasons.length) {
  try {
    writeFileSync(counterPath, String(blocksSoFar + 1))
  } catch {}

  process.stderr.write(
    'testing — before you stop:\n' + reasons.map((r) => ' - ' + r).join('\n') + '\n',
  )

  process.exit(2)
}

process.exit(0)

// Survived mutants from the freshest Stryker JSON report written during this session, minus the ones the
// agent's final message already talks about (by line number or by an explicit disable comment in the source).
function unclassifiedSurvivors(root, cfg, since, finalText) {
  const candidates = []
  const explicit = cfg.mutation?.report

  if (explicit) {
    candidates.push(join(root, explicit))
  }

  for (const dir of ['.', ...listDirs(join(root, 'packages')), ...listDirs(join(root, 'apps'))]) {
    for (const rel of [
      'reports/mutation/report.json',
      'reports/mutation/mutation.json',
      'reports/mutation/mutation-report.json',
    ]) {
      candidates.push(join(root, dir, rel))
    }
  }
  let best = null

  for (const p of candidates) {
    if (!existsSync(p)) {
      continue
    }
    const mtime = statSync(p).mtimeMs

    if (since && mtime < since - 60_000) {
      continue
    } // stale: written before this session

    if (!best || mtime > best.mtime) {
      best = { p, mtime }
    }
  }

  if (!best) {
    return []
  }
  let report
  try {
    report = JSON.parse(readFileSync(best.p, 'utf8'))
  } catch {
    return []
  }
  const out = []

  for (const [file, data] of Object.entries(report.files || {})) {
    const src =
      safeRead(join(root, file)) || safeRead(join(root, dirOf(best.p, 'reports'), file)) || ''

    const srcLines = src.split('\n')

    for (const m of data.mutants || []) {
      if (m.status !== 'Survived') {
        continue
      }
      const line = m.location?.start?.line
      const prev = srcLines[line - 2] || ''

      if (/Stryker disable/i.test(prev)) {
        continue
      }

      if (line && new RegExp(`(^|[^\\d.])${line}([^\\d]|$)`).test(finalText)) {
        continue
      }

      out.push({
        file: file.split('/').slice(-2).join('/'),
        line,
        mutator: m.mutatorName,
        replacement: String(m.replacement || '')
          .replace(/\s+/g, ' ')
          .slice(0, 60),
      })
    }
  }

  return out
}

function listDirs(p) {
  try {
    return readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join(p, d.name).replace(cwd + '/', ''))
  } catch {
    return []
  }
}

function safeRead(p) {
  try {
    return readFileSync(p, 'utf8')
  } catch {
    return null
  }
}

function dirOf(p, marker) {
  const i = p.indexOf('/' + marker + '/')

  return i < 0 ? '.' : p.slice(0, i).replace(cwd + '/', '')
}

function gitToplevel(dir) {
  try {
    return (
      execSync('git rev-parse --show-toplevel', {
        cwd: dir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() || dir
    )
  } catch {
    return dir
  }
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
