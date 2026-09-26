// @ts-nocheck

// --- Direct parent re-exports (6 violations) ---
export { foo } from '../../parent-mod'
export { bar as baz } from '../../parent-mod'
export type { Foo } from '../../parent-mod'
export { default } from '../../parent-mod'
export * from '../../parent-mod'
export type * from '../../parent-mod'

import type { Qux } from '../../parent-mod'
// --- Indirect parent re-exports (2 violations) ---
import { qux } from '../../parent-mod'
export { qux }
export type { Qux }

// --- Sibling re-exports (allowed, no violations) ---
export { sibling } from './sibling-mod'
export type { Sibling } from './sibling-mod'
