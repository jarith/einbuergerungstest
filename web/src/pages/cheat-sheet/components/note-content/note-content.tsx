import { Stack } from '@einbuergerungstest/design-system/jsx'

import type { NoteGroup, NoteText } from '../../cheat-sheet.model'
import { styles } from './note-content.styles'

type RichTextProps = Readonly<{ content: NoteText }>

type NoteContentProps = Readonly<{ group: NoteGroup }>

const RichText = ({ content }: RichTextProps) =>
  content.map((part, index) => {
    if (part.strong) {
      return <strong key={index}>{part.text}</strong>
    }

    return part.text
  })

export const NoteContent = ({ group }: NoteContentProps) => (
  <Stack gap="20" css={styles.root}>
    {group.blocks.map((block, index) => {
      if (block.items !== undefined) {
        const List = block.type === 'ordered-list' ? 'ol' : 'ul'

        return (
          <Stack as={List} key={index} gap="12" className={styles.list}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} data-leading-term={item[0]?.strong === true ? true : undefined}>
                <RichText content={item} />
              </li>
            ))}
          </Stack>
        )
      }

      if (block.type === 'heading') {
        return (
          <h3 key={index} className={styles.heading}>
            <RichText content={block.content} />
          </h3>
        )
      }

      return (
        <p key={index}>
          <RichText content={block.content} />
        </p>
      )
    })}
  </Stack>
)
