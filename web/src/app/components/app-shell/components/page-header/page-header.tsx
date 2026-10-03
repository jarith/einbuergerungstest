import { styles } from './page-header.styles'

export type PageLink = Readonly<{ label: string; href: string }>

type PageHeaderProps = Readonly<{
  title: string
  links: readonly PageLink[]
  isTitleHidden?: boolean
}>

export const PageHeader = ({ title, links, isTitleHidden = false }: PageHeaderProps) => (
  <Wrap
    alignItems="center"
    justifyContent="space-between"
    css={{ ...styles.header }}
    data-hidden={isTitleHidden && links.length === 0 ? true : undefined}
  >
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
  </Wrap>
)
import { Wrap } from '@einbuergerungstest/design-system/jsx'
