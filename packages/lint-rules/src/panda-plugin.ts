import { createPandaPlugin } from '@pandacss/eslint-plugin'

import { resolve } from 'node:path'

// Bind the same Panda project when Oxlint runs from the root or any workspace.
const { rules } = await createPandaPlugin({
  cwd: resolve(import.meta.dirname, '../../design-system'),
  configPath: resolve(import.meta.dirname, '../../design-system/panda.config.ts'),
})

export default { meta: { name: '@pandacss' }, rules }
