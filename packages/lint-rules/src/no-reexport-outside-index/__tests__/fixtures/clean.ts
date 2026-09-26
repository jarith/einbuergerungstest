// @ts-nocheck

// --- Local exports ---
export const foo = 1
export type Foo = string

// --- Inline function export ---
export const bar = () => {}

import type { Baz } from './foo'
// --- Named imports (not re-exports) ---
import { baz } from './foo'

// --- Local variable exported via named export (not a re-export) ---
const qux = 42
export { qux }
