// @ts-nocheck

interface MyInterface {
  x: number
}

// --- Named type on param ---
const namedParam = (p: MyInterface) => p.x

// --- Primitive type on param ---
const primitiveParam = (p: number) => p

// --- Named return type ---
const namedReturn = (): MyInterface => ({ x: 1 })

// --- Type alias with object shape ---
type Foo = { bar: string }

// --- Interface definition ---
interface Bar {
  baz: string
}

// --- Interface property with inline object type (not a function param) ---
interface WithInlineProp {
  data: { bar: string }
}

// --- Generic with named type arg ---
const genericNamed = (p: Array<MyInterface>) => p

// --- No type annotations ---
const noTypes = (p) => p
