// @ts-nocheck

// --- Token names (allowed) ---
const a = { fontSize: 'sm' }
const b = { fontSize: '2xl' }

// --- Responsive objects with tokens (allowed) ---
const c = { fontSize: { base: 'sm', tablet: 'lg' } }

// --- Variable references (allowed) ---
const size = 'md'
const d = { fontSize: size }

// --- Other properties with pixel values (allowed) ---
const e = { height: '14px', width: '24px', padding: '8px' }
