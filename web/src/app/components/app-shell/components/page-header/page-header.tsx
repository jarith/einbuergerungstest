import { styles } from './page-header.styles'

export type PageLink = Readonly<{ label: string; href: string }>

type PageHeaderProps = Readonly<{
  context: string
  title: string
  links: readonly PageLink[]
  isTitleHidden?: boolean
}>

export const PageHeader = ({ context, title, links, isTitleHidden = false }: PageHeaderProps) => (
  <>
    <Flex css={{ ...styles.context }}>{context}</Flex>
    <h1 className={isTitleHidden ? styles.hiddenHeading : styles.heading}>{title}</h1>
    {links.length === 0 ? null : (
      <Wrap css={{ ...styles.secondary }}>
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </Wrap>
    )}
  </>
)
import { Flex, Wrap } from '@einbuergerungstest/design-system/jsx'
