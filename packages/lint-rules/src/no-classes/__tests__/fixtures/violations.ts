// @ts-nocheck

// --- Named class declaration ---
class Foo {
  bar() {}
}

// --- Class expression assigned to const ---
const Baz = class {
  qux() {}
}

// --- Class with extends ---
class Child extends Foo {
  baz() {}
}
