// @ts-nocheck

// Single atom .set() — no action needed
const setFoo = () => {
  fooAtom.set(1)
}

// Same atom set twice — only 1 distinct atom
const setFooTwice = () => {
  fooAtom.set(1)
  fooAtom.set(2)
}

// Inside action() — valid
const wrapped = action(() => {
  fooAtom.set(1)
  barAtom.set(2)
})

// Inside withActions() — valid
const myAtom = atom(0).extend(
  withActions({
    doThings() {
      fooAtom.set(1)
      barAtom.set(2)
    },
  }),
)

// Map.set() — not an atom
const myMap = new Map()
myMap.set('foo', 1)

// Atom reads — not sets
const val = fooAtom()

// Nested functions — each is its own scope (1 distinct atom each)
const outer = () => {
  fooAtom.set(1)
  const inner = () => {
    barAtom.set(2)
  }
}
