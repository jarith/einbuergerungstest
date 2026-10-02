import { action, atom, computed, withConnectHook, wrap } from '@reatom/core'

type OfflineStatus = 'not-ready' | 'preparing' | 'ready' | 'error' | 'unsupported'

export const createOfflineModel = () => {
  const status = atom<OfflineStatus>('not-ready', 'offline.status')
  const media = window.matchMedia('(display-mode: standalone)')
  const isStandalone = () =>
    media.matches || ('standalone' in navigator && navigator.standalone === true)

  const standalone = atom(isStandalone(), 'offline.standalone').extend(
    withConnectHook(() => {
      const update = wrap(action(() => standalone.set(isStandalone()), 'offline.updateDisplayMode'))

      media.addEventListener('change', update)

      update()

      return () => media.removeEventListener('change', update)
    }),
  )

  return computed(() => status(), 'offline').extend(() => ({ standalone }))
}
