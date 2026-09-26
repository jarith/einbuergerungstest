// @ts-nocheck

// --- Atom<> in Props interface triggers violation ---
interface FooProps {
  value: Atom<number>
}

// --- AtomMut<> in Props interface triggers violation ---
interface BarProps {
  name: AtomMut<string>
}

// --- Computed<> in Props interface triggers violation ---
interface BazProps {
  flag: Computed<boolean>
}
