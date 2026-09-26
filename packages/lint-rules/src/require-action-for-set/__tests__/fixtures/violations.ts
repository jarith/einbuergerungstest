// @ts-nocheck

// Violation 1: plain function with 2 distinct atoms
const doStuff = () => {
  fooAtom.set(1)
  barAtom.set(2)
}

// Violation 2: callback with 2 distinct atoms
const handler = (x) => {
  bazAtom.set(x)
  quxAtom.set(x)
}

// Violation 3: module-scope multi-atom mutations
fooAtom.set(10)
barAtom.set(20)
