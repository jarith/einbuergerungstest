// @ts-nocheck

// --- Arrow function with inline param type ---
const arrowInlineParam = (p: { x: number }) => p.x

// --- Function declaration with inline param type ---
function fnDeclInlineParam(p: { x: number }) {
  return p.x
}

// --- Inline return type ---
const arrowInlineReturn = (): { x: number } => ({ x: 1 })

// --- Destructured param with inline type ---
const destructuredParam = ({ x }: { x: number }) => x

// --- Generic wrapping inline type in param ---
const genericParam = (p: Array<{ x: number }>) => p

// --- Generic wrapping inline type in return ---
const genericReturn = (): Promise<{ x: number }> => Promise.resolve({ x: 1 })

// --- Function type expression with inline param ---
type FnType = (p: { x: number }) => void
