import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

const exec = promisify(execFile)

type WorkspaceManifest = Readonly<{ workspaces: readonly string[] }>

const isCode = (error: unknown, code: string): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error && error.code === code

const isWorkspaceManifest = (manifest: unknown): manifest is WorkspaceManifest =>
  typeof manifest === 'object' &&
  manifest !== null &&
  'workspaces' in manifest &&
  Array.isArray(manifest.workspaces) &&
  manifest.workspaces.every((workspace): workspace is string => typeof workspace === 'string')

export const findWorkspaceRoot = async (start: string): Promise<string> => {
  const directory = resolve(start)
  try {
    const manifest: unknown = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'))

    if (isWorkspaceManifest(manifest) && manifest.workspaces.includes('packages/*'))
      return directory
  } catch (error) {
    if (!isCode(error, 'ENOENT')) throw error
  }
  const parent = dirname(directory)

  if (parent === directory)
    throw new Error('Run this command inside a repository with packages/* workspaces.')

  return findWorkspaceRoot(parent)
}

/** Creates infrastructure only. Existing destinations are never replaced. */
export const createPackage = async (root: string, name: string): Promise<string> => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(name)) {
    throw new Error('Use a kebab-case package name, for example: date-utils.')
  }
  const destination = join(root, 'packages', name)

  await mkdir(join(root, 'packages'), { recursive: true })

  try {
    await mkdir(destination)
  } catch (error) {
    if (isCode(error, 'EEXIST'))
      throw new Error(`Package directory already exists: packages/${name}`, { cause: error })
    throw error
  }

  const manifest = {
    name: `@app/${name}`,
    private: true,
    type: 'module',
    exports: { '.': './src/index.ts' },
    scripts: {
      typecheck: 'yarn run -T tsc -p tsconfig.json && yarn run -T tsc -p tsconfig.test.json',
      lint: 'yarn run -T oxlint .',
      'format:check': 'yarn run -T oxfmt --check .',
    },
  }

  const tsconfig = {
    extends: '../../tsconfig.json',
    include: ['src'],
    exclude: ['src/**/*.test.ts'],
  }

  const testConfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      lib: ['ES2025', 'DOM', 'DOM.Iterable', 'ESNext.Disposable'],
      types: ['node'],
    },
    include: ['src/index.ts', 'src/**/*.test.ts'],
  }

  try {
    await mkdir(join(destination, 'src'))

    await writeFile(join(destination, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)

    await writeFile(join(destination, 'tsconfig.json'), `${JSON.stringify(tsconfig, null, 2)}\n`)

    await writeFile(
      join(destination, 'tsconfig.test.json'),
      `${JSON.stringify(testConfig, null, 2)}\n`,
    )

    await writeFile(join(destination, 'src/index.ts'), 'export {}\n')

    await exec(join(root, 'node_modules/.bin/oxfmt'), [
      '--write',
      '-c',
      join(root, '.oxfmtrc.json'),
      destination,
    ])
  } catch (error) {
    await rm(destination, { recursive: true, force: true })

    throw error
  }

  return destination
}
