import { token } from '@einbuergerungstest/design-system'

import { styles } from './study-motion.styles'

type Direction = 'next' | 'previous'

type Departure = Readonly<{
  key: string
  index: number
  direction: Direction
  snapshot: HTMLElement
}>

type MotionLifecycle = {
  current: HTMLElement | null
  departure: Departure | null
  stop: (() => void) | undefined
}

/** DOM-only transition lifecycle, owned by one study session across route reloads. */
export const createStudyMotion = () => {
  const lifecycle: MotionLifecycle = { current: null, departure: null, stop: undefined }

  const clear = () => {
    lifecycle.departure = null
    lifecycle.stop?.()
    lifecycle.stop = undefined
  }

  return {
    clear,
    prepare: (key: string, index: number, direction: Direction) => {
      clear()

      const content = lifecycle.current?.firstElementChild

      if (
        content === undefined ||
        !(content instanceof HTMLElement) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      const snapshot = content.cloneNode(true)

      if (!(snapshot instanceof HTMLElement)) {
        return
      }

      snapshot.inert = true

      snapshot.setAttribute('aria-hidden', 'true')

      snapshot.removeAttribute('id')

      snapshot.querySelectorAll('[id], [data-question-heading], [aria-live]').forEach((element) => {
        element.removeAttribute('id')

        element.removeAttribute('data-question-heading')

        element.removeAttribute('aria-live')
      })

      snapshot.className = `${snapshot.className} ${styles.outgoing}`

      snapshot.dataset['studyOutgoing'] = ''
      lifecycle.departure = { key, index, direction, snapshot }
    },
    connect: (element: HTMLDivElement | null, key: string, index: number) => {
      if (element === null) {
        return undefined
      }

      lifecycle.current = element
      const pending = lifecycle.departure
      const content = element.firstElementChild
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)')

      if (pending !== null && pending.key !== key) {
        lifecycle.departure = null

        const step = pending.direction === 'next' ? 1 : -1

        if (
          content instanceof HTMLElement &&
          index === pending.index + step &&
          !preference.matches
        ) {
          lifecycle.stop?.()

          const isCompact = window.matchMedia('(max-width: 47.999rem)').matches
          const distance = token.var(isCompact ? 'spacing.32' : 'spacing.48')
          const offset = `calc(${distance} * ${step})`

          const incoming = content.animate(
            [
              { transform: `translateX(${offset})`, opacity: 0 },
              { transform: 'translateX(0)', opacity: 1 },
            ],
            {
              duration: Number.parseFloat(
                token(isCompact ? 'durations.navigationCompact' : 'durations.navigation'),
              ),
              easing: token('easings.enter'),
            },
          )

          element.append(pending.snapshot)

          const outgoing = pending.snapshot.animate(
            [
              { transform: 'translateX(0)', opacity: 1 },
              { transform: `translateX(calc(${offset} * -1))`, opacity: 0 },
            ],
            {
              duration: Number.parseFloat(token('durations.feedback')),
              easing: token('easings.exit'),
              fill: 'forwards',
            },
          )

          const finish = () => {
            incoming.cancel()

            outgoing.cancel()

            pending.snapshot.remove()

            preference.removeEventListener('change', finish)

            if (lifecycle.stop === finish) {
              lifecycle.stop = undefined
            }
          }

          outgoing.onfinish = () => pending.snapshot.remove()
          incoming.onfinish = finish

          preference.addEventListener('change', finish)

          lifecycle.stop = finish
        }
      }

      return () => {
        if (lifecycle.current === element) {
          lifecycle.current = null
          const stop = lifecycle.stop

          // StrictMode reattaches the same ref before paint. Keep its slide alive;
          // only dispose motion when this element actually leaves the session.
          queueMicrotask(() => {
            if (lifecycle.current !== element) {
              stop?.()
            }

            if (lifecycle.current === null) {
              clear()
            }
          })
        }
      }
    },
  }
}
