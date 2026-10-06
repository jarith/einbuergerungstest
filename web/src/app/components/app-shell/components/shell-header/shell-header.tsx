import { styles } from './shell-header.styles'

type ShellHeaderProps = Readonly<{ brand: string; isCompactHidden?: boolean }>

export const ShellHeader = ({ brand, isCompactHidden = false }: ShellHeaderProps) => (
  <Stack as="header" css={{ ...styles.header }} data-compact-hidden={isCompactHidden || undefined}>
    <span className={styles.title}>{brand}</span>
    <span className={styles.region}>BERLIN</span>
  </Stack>
)
import { Stack } from '@einbuergerungstest/design-system/jsx'
