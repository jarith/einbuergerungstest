import { action, atom, computed } from '@reatom/core'

export const createCounterModel = () => {
  const countAtom = atom(0, 'counter.count')
  const doubledAtom = computed(() => countAtom() * 2, 'counter.doubled')

  return countAtom.extend(() => ({
    doubled: doubledAtom,
    increment: action(() => countAtom.set((value) => value + 1), 'counter.increment'),
    reset: action(() => countAtom.set(0), 'counter.reset'),
  }))
}
