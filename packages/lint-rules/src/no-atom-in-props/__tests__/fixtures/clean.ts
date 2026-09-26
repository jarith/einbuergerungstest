// @ts-nocheck

// --- Plain values in Props interface are clean ---
interface FooProps {
  value: number
  name: string
  flag: boolean
}

// --- Atom<> used outside of Props interfaces is clean ---
interface AtomStore {
  counter: Atom<number>
}

const myAtom: Atom<string> = atom('hello')
