import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const getBuildVersion = () =>
  process.env['VITE_APP_VERSION'] ??
  process.env['GITHUB_SHA'] ??
  execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()

export const getBuildOutput = () =>
  process.env['APP_BUILD_OUTPUT'] ?? fileURLToPath(new URL('../dist/', import.meta.url))
