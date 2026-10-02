import { atom, withConnectHook, wrap } from '@reatom/core'

export const createPendingNoticeAtom = () =>
  atom(false, 'pendingNotice.isLongWait').extend(
    withConnectHook((isLongWait) => {
      isLongWait.set(false)

      const timer = setTimeout(
        wrap(() => isLongWait.set(true)),
        15_000,
      )

      return () => clearTimeout(timer)
    }),
  )
