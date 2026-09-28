import { action, atom, computed, effect, onEvent, urlAtom, withAsync, wrap } from '@reatom/core'

type Departure = Readonly<{ leave: () => Promise<void> }>

type PendingNavigation = Readonly<{
  destination: URL
  replace: boolean
  historyDelta?: number
  departure: Departure
}>

type NavigationPolicy = (destination: URL) => Departure | null

type HistoryPosition = { current: number; restoring: PendingNavigation | null }

const pendingAtom = atom<PendingNavigation | null>(null, 'navigation.pending')

const errorAtom = atom<Error | undefined>(undefined, 'navigation.error')

// The History API is an untyped browser boundary.
const readIndex = () => {
  const state: unknown = history.state

  // oxlint-disable-next-line app/no-runtime-typeof -- Narrow browser-owned history state.
  if (typeof state !== 'object' || state === null || !('appNavigationIndex' in state)) {
    return 0
  }

  // oxlint-disable-next-line app/no-runtime-typeof -- Validate the stored history index.
  return typeof state.appNavigationIndex === 'number' ? state.appNavigationIndex : 0
}

export const browserNavigationAtom = computed(() => pendingAtom() !== null, 'navigation').extend(
  () => ({
    error: computed(() => errorAtom(), 'navigation.errorView'),
    cancel: action(() => {
      pendingAtom.set(null)

      errorAtom.set(undefined)
    }, 'navigation.cancel'),
    confirm: action(async () => {
      const pending = pendingAtom()

      if (pending === null) {
        return
      }

      errorAtom.set(undefined)

      try {
        await wrap(pending.departure.leave())

        pendingAtom.set(null)

        if (pending.historyDelta === undefined) {
          urlAtom.go(pending.destination.href, pending.replace)
        } else {
          history.go(pending.historyDelta)
        }
      } catch (cause: unknown) {
        errorAtom.set(
          cause instanceof Error
            ? cause
            : new Error('Could not save the unfinished test.', { cause }),
        )
      }
    }, 'navigation.confirm').extend(withAsync()),
    start: action((getDeparture: NavigationPolicy) => {
      const historyPosition: HistoryPosition = { current: readIndex(), restoring: null }

      // Own the browser adapter so a cancelled popstate never replaces a history entry.
      // Reatom still owns route matching, URL state, loaders and typed navigation.
      urlAtom.catchLinks.set(false)

      urlAtom.sync.set(() => (url, replace = false) => {
        historyPosition.current += replace ? 0 : 1

        const state = { appNavigationIndex: historyPosition.current }

        if (replace) {
          history.replaceState(state, '', url)
        } else {
          history.pushState(state, '', url)
        }
      })

      urlAtom.set(new URL(location.href), true)

      const setUrl = urlAtom.set.bind(urlAtom)

      urlAtom.set = action((update: URL | ((url: URL) => URL), replace = false) => {
        const current = urlAtom()
        const destination = update instanceof URL ? update : update(current)
        const departure = destination.href === current.href ? null : getDeparture(destination)

        if (departure !== null) {
          pendingAtom.set({ destination, replace, departure })

          errorAtom.set(undefined)

          return current
        }

        return setUrl(destination, replace)
      }, 'navigation.setUrl')

      return effect(() => {
        onEvent(window, 'popstate', () => {
          if (historyPosition.restoring !== null) {
            const delta = historyPosition.current - readIndex()

            if (delta !== 0) {
              history.go(delta)
            } else {
              pendingAtom.set(historyPosition.restoring)

              historyPosition.restoring = null
            }

            return
          }
          const destination = new URL(location.href)
          const departure = getDeparture(destination)
          const index = readIndex()

          if (departure !== null) {
            historyPosition.restoring = {
              destination,
              replace: false,
              departure,
              historyDelta: index - historyPosition.current,
            }

            errorAtom.set(undefined)

            history.go(historyPosition.current - index)
          } else {
            historyPosition.current = index

            urlAtom.syncFromSource(destination, true)
          }
        })

        onEvent(document.body, 'click', (event) => {
          const link = event.target instanceof Element ? event.target.closest('a') : null

          if (
            link === null ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            link.hasAttribute('download') ||
            (link.target !== '' && link.target !== '_self') ||
            link.origin !== location.origin ||
            link.rel === 'external'
          ) {
            return
          }

          event.preventDefault()

          urlAtom.go(link.href)

          if (link.hash !== '') {
            document.getElementById(link.hash.slice(1))?.focus()
          }
        })

        onEvent(window, 'beforeunload', (event) => {
          if (getDeparture(new URL('/__departure__', location.origin)) !== null) {
            event.preventDefault()

            // oxlint-disable-next-line typescript/no-deprecated -- Safari's beforeunload confirmation still needs returnValue.
            event.returnValue = ''
          }
        })
      }, 'navigation.browserEvents')
    }, 'navigation.start'),
  }),
)
