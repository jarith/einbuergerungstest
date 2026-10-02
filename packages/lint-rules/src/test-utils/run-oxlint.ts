import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

type LintResult = Readonly<{
  exitCode: number
  stdout: string
  stderr: string
}>

const repoRoot = resolve(import.meta.dirname, '../../../..')

// oxlint-disable-next-line typescript/strict-void-return -- promisify intentionally ignores execFile's returned ChildProcess.
const execFileAsync = promisify(execFile)

export const runOxlint = async (
  configPath: string,
  filePath: string,
  args: readonly string[] = [],
): Promise<LintResult> => {
  // Run the real project configuration, not plugins' internal NODE_ENV=test fixtures.
  const env = { ...process.env }
  env['NODE_ENV'] = 'development'
  delete env['GITHUB_ACTIONS']

  try {
    const { stdout, stderr } = await execFileAsync(
      resolve(repoRoot, 'node_modules/.bin/oxlint'),
      ['-c', configPath, '--format', 'agent', ...args, filePath],
      { cwd: repoRoot, encoding: 'utf8', env },
    )

    return { exitCode: 0, stdout, stderr }
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      typeof error.code === 'number' &&
      'stdout' in error &&
      typeof error.stdout === 'string' &&
      'stderr' in error &&
      typeof error.stderr === 'string'
    ) {
      return { exitCode: error.code, stdout: error.stdout, stderr: error.stderr }
    }

    throw error
  }
}
