// @ts-nocheck

// --- Factory functions (allowed) ---
const createFoo = () => ({
  bar: () => {},
})

// --- Object literals (allowed) ---
const obj = {
  x: 1,
  y: 2,
}

// --- Arrow functions (allowed) ---
const fn = (x) => x * 2
