// @ts-nocheck

// --- Named re-exports ---
export { foo } from './foo'
export { bar as baz } from './foo'
export type { Foo } from './foo'

// --- Default re-export ---
export { default } from './foo'

// --- Wildcard re-exports ---
export * from './foo'
export type * from './foo'

import type { Qux } from './foo'
// --- Indirect re-exports (import then export) ---
import { qux } from './foo'
export { qux }
export type { Qux }
