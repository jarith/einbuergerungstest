import { styles } from './shell-header.styles'

type ShellHeaderProps = Readonly<{ brand: string }>

export const ShellHeader = ({ brand }: ShellHeaderProps) => (
  <Stack as="header" css={{ ...styles.header }}>
    <span className={styles.title}>{brand}</span>
    <span className={styles.region}>BERLIN</span>
  </Stack>
)
import { Stack } from '@einbuergerungstest/design-system/jsx'
