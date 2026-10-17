import { action, atom, computed, withAsync, wrap } from '@reatom/core'

import type { AppResources } from '../../app/bootstrap.model'
import de from './content/de.json'
import en from './content/en.json'
import ru from './content/ru.json'

const catalogs = { de, en, ru }

export type NoteGroup = (typeof en)['groups'][number]

export type NoteText = ReadonlyArray<Readonly<{ text: string; strong: boolean }>>

export const createCheatSheetModel = ({ localization }: Pick<AppResources, 'localization'>) => {
  const expanded = atom<string[]>([], 'cheatSheet.expanded')

  const downloadStatus = atom<'idle' | 'preparing' | 'ready' | 'error'>(
    'idle',
    'cheatSheet.downloadStatus',
  )

  return computed(() => catalogs[localization.language()], 'cheatSheet.content').extend(() => ({
    localization,
    expanded,
    downloadStatus,
    closeGroup: action((id: string) => {
      expanded.set((groups) => groups.filter((group) => group !== id))
    }, 'cheatSheet.closeGroup'),
    download: action(async () => {
      if (downloadStatus() === 'preparing') {
        return
      }

      const language = localization.language()
      const filename = `einbuergerungstest-berlin-cheat-sheet-${language}.pdf`

      downloadStatus.set('preparing')

      try {
        const response = await wrap(
          fetch(`/cheat-sheet/${filename}`, { signal: AbortSignal.timeout(60_000) }),
        )

        if (
          !response.ok ||
          response.headers.get('content-type')?.includes('application/pdf') !== true
        ) {
          throw new Error('The cheat sheet PDF could not be loaded. Try again.')
        }
        const blob = await wrap(response.blob())
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename

        link.click()

        // Leave time for the browser/PDF viewer to consume the object URL.
        setTimeout(() => URL.revokeObjectURL(url), 60_000)

        downloadStatus.set('ready')
      } catch {
        downloadStatus.set('error')
      }
    }, 'cheatSheet.download').extend(withAsync()),
  }))
}

export type CheatSheetModel = ReturnType<typeof createCheatSheetModel>
