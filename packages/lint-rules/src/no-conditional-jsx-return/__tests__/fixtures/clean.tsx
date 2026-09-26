// @ts-nocheck

// --- Explicit if with early return ---
const ExplicitReturn = () => {
  if (!cond) return null
  return <div />
}

// --- Conditional inside JSX ---
const ConditionalInJSX = () => <div>{cond && <span />}</div>

// --- Non-JSX conditional return ---
const getValue = () => (cond ? 'a' : 'b')

// --- Simple JSX return ---
const SimpleJSX = () => <div>hello</div>

// --- Reatom reactive expression ---
const ReatomReactive = () => <div>{() => (cond ? <span>A</span> : <span>B</span>)}</div>

// --- Concise arrow with inline JSX conditional ---
const InlineConditional = () => <div>{cond && <span />}</div>
