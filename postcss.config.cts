import type Panda from '@pandacss/dev/postcss'

import type Path from 'node:path'

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Type CommonJS require using the package's declared export.
const panda = require('@pandacss/dev/postcss') as typeof Panda

// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Type CommonJS require using Node's declared export.
const path = require('node:path') as typeof Path

module.exports = {
  plugins: [
    panda({
      configPath: path.join(__dirname, 'packages/design-system/panda.config.ts'),
      cwd: path.join(__dirname, 'packages/design-system'),
    }),
  ],
}
