import { action, atom, context } from '@reatom/core'

export const createAppModel = () => {
  const colorSchemeAtom = atom<'light' | 'dark'>('light', 'app.colorScheme')

  return {
    frame: context.start(),
    colorScheme: colorSchemeAtom,
    toggleColorScheme: action(
      () => colorSchemeAtom.set((value) => (value === 'light' ? 'dark' : 'light')),
      'app.toggleColorScheme',
    ),
  }
}
