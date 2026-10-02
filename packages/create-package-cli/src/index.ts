import { createPackage, findWorkspaceRoot } from './generator'

try {
  const [name, ...extra] = process.argv.slice(2)

  if (name === undefined || name === '' || extra.length > 0) {
    throw new Error('Usage: yarn create:package <kebab-case-name>')
  }
  const root = await findWorkspaceRoot(process.cwd())

  await createPackage(root, name)

  console.log(
    `Created @einbuergerungstest/${name} in packages/${name}. Run yarn install to link the workspace.`,
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))

  process.exitCode = 1
}
