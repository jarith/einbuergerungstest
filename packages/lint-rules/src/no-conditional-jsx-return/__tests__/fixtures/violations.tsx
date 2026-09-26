// @ts-nocheck

// --- Concise arrow ternary ---
const A = () => (cond ? <div /> : null)

// --- Concise arrow && ---
const B = () => cond && <div />

// --- Concise arrow || ---
const C = () => cond || <div />

// --- Concise arrow ?? ---
const D = () => cond ?? <div />

// --- Block body ternary return ---
const E = () => {
  return cond ? <div /> : null
}

// --- Block body && return ---
const F = () => {
  return cond && <div />
}

// --- Parenthesized concise ternary ---
const G = () => (cond ? <div /> : null)

// --- Both branches JSX ---
const H = () => (cond ? <div>A</div> : <div>B</div>)
