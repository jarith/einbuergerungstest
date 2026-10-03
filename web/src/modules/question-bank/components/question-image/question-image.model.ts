import { action, atom } from '@reatom/core'

export const createQuestionImageModel = () => {
  const model = atom(
    { isOpen: false, zoom: 1, revision: 0, hasInlineError: false, hasFullError: false },
    'questionImage',
  )

  return model.extend(() => ({
    open: action(
      () => model.set((state) => ({ ...state, isOpen: true, zoom: 1 })),
      'questionImage.open',
    ),
    close: action(() => model.set((state) => ({ ...state, isOpen: false })), 'questionImage.close'),
    zoomIn: action(
      () => model.set((state) => ({ ...state, zoom: Math.min(3, state.zoom + 1) })),
      'questionImage.zoomIn',
    ),
    zoomOut: action(
      () => model.set((state) => ({ ...state, zoom: Math.max(1, state.zoom - 1) })),
      'questionImage.zoomOut',
    ),
    failInline: action(
      () => model.set((state) => ({ ...state, hasInlineError: true })),
      'questionImage.failInline',
    ),
    failFull: action(
      () => model.set((state) => ({ ...state, hasFullError: true })),
      'questionImage.failFull',
    ),
    retry: action(
      () =>
        model.set((state) => ({
          ...state,
          revision: state.revision + 1,
          hasInlineError: false,
          hasFullError: false,
        })),
      'questionImage.retry',
    ),
  }))
}
