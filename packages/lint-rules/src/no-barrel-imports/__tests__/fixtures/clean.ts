// @ts-nocheck

import type { Foo } from './foo'
// --- Named imports (allowed) ---
import { foo } from './foo'
import { bar, baz } from './utils'

// --- Named re-exports (allowed) ---
export { foo } from './foo'
export type { Foo } from './foo'
