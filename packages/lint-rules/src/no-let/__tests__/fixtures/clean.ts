// @ts-nocheck

// --- Const declarations (allowed) ---
const a = 1
const b = 'hello'

// --- Classic for loop with let (allowed) ---
for (let i = 0; i < 10; i++) {}

// --- Arrow functions with const (allowed) ---
const fn = () => {
  const x = 42

  return x
}
