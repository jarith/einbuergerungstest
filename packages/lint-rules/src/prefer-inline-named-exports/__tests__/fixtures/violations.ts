// @ts-nocheck

const single = 1
export { single }

const first = 1
const second = 2
export { first, second }

const alias = 1
export { alias as renamed }

type LocalType = {
  label: string
}

export type { LocalType }

import { importedValue } from './support'

export { importedValue }
