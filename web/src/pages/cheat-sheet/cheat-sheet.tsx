import { Accordion } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import type { PageProps } from '../../app/routing'
import type { CheatSheetModel } from './cheat-sheet.model'
import { styles } from './cheat-sheet.styles'
import { NoteContent } from './components/note-content/note-content'
import { PdfDownload } from './components/pdf-download/pdf-download'

type CheatSheetPageProps = PageProps<{ model: CheatSheetModel }>

export const CheatSheetPage = reatomComponent(({ data: { model } }: CheatSheetPageProps) => {
  const t = model.localization.t()
  const content = model()

  return (
    <Stack gap="24" css={styles.root} lang={model.localization.language()}>
      <p>{t('cheatSheet.introduction')}</p>
      <PdfDownload model={model} />
      <Accordion
        appearance="separated"
        multiple
        keepMounted={false}
        order={2}
        value={model.expanded()}
        onChange={wrap((value) => model.expanded.set(value))}
      >
        {content.groups.map((group) => (
          <Accordion.Group
            key={group.id}
            value={group.id}
            title={group.title}
            number={group.number}
            closeAction={{
              label: t('cheatSheet.closeGroup'),
              onClose: wrap(() => model.closeGroup(group.id)),
            }}
          >
            <NoteContent group={group} />
          </Accordion.Group>
        ))}
      </Accordion>
    </Stack>
  )
}, 'CheatSheetPage')
