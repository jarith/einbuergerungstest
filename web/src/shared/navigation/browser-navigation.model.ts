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

const pageArrival = atom<Readonly<{ href: string; isHistory: boolean }> | null>(
  null,
  'navigation.pageArrival',
)

const lastNavigationTap = atom<Readonly<{ href: string; time: number }> | null>(
  null,
  'navigation.lastTap',
)

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
    // In-page route changes retain the initiating control's focus and scroll position.
    withinPage: action((navigate: () => void) => {
      navigate()

      pageArrival.set(null)
    }, 'navigation.withinPage'),
    error: computed(() => errorAtom(), 'navigation.errorView'),
    // Called by the rendered route, after its loader and DOM have caught up with the URL.
    complete: action((page: HTMLElement | null) => {
      const arrival = pageArrival()

      if (page === null || arrival === null || arrival.href !== location.href) {
        return undefined
      }

      const frame = requestAnimationFrame(
        wrap(() => {
          if (!page.isConnected || arrival !== pageArrival() || arrival.href !== location.href) {
            return
          }

          pageArrival.set(null)

          const anchor =
            location.hash === '' ? null : document.getElementById(location.hash.slice(1))

          const heading =
            page.querySelector<HTMLElement>('[data-question-heading]') ??
            document.querySelector<HTMLElement>('main h1')

          const target = anchor ?? heading ?? document.getElementById('main')

          if (target !== null) {
            target.tabIndex = -1

            target.focus({ preventScroll: true })
          }

          if (!arrival.isHistory) {
            if (anchor === null) {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
            } else {
              anchor.scrollIntoView()
            }
          }
        }),
      )

      return () => cancelAnimationFrame(frame)
    }, 'navigation.complete'),
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
        if (url.href !== location.href) {
          pageArrival.set({
            href: url.href,
            isHistory: replace && pageArrival()?.isHistory === true,
          })

          lastNavigationTap.set(null)
        }

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

            pageArrival.set({ href: destination.href, isHistory: true })

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
            lastNavigationTap.set(null)

            return
          }

          event.preventDefault()

          if (link.hasAttribute('data-navigation-current')) {
            const previous = lastNavigationTap()
            const isRepeated = previous?.href === link.href && event.timeStamp - previous.time < 400

            lastNavigationTap.set(
              isRepeated || event.detail === 0 ? null : { href: link.href, time: event.timeStamp },
            )

            if (isRepeated || event.detail === 0) {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'instant'
                  : 'smooth',
              })
            }

            return
          }

          lastNavigationTap.set(null)

          urlAtom.go(link.href)

          if (link.hash !== '') {
            document.getElementById(link.hash.slice(1))?.focus()
          }
        })

        onEvent(document.body, 'pointercancel', () => {
          lastNavigationTap.set(null)
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
