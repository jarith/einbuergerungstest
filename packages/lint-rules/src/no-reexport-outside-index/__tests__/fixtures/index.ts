// @ts-nocheck

// --- Named re-exports (allowed in index files) ---
export { foo } from './foo'
export { bar as baz } from './foo'
export type { Foo } from './foo'

// --- Default re-export (allowed in index files) ---
export { default } from './foo'

// --- Wildcard re-exports (allowed in index files) ---
export * from './foo'
export type * from './foo'
