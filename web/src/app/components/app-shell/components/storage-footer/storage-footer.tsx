import { Database } from 'lucide-react'

import { styles } from './storage-footer.styles'

type StorageFooterProps = Readonly<{ label: string }>

export const StorageFooter = ({ label }: StorageFooterProps) => (
  <HStack as="footer" css={{ ...styles.footer }}>
    <Database aria-hidden="true" focusable="false" className={styles.icon} />
    <span>{label}</span>
  </HStack>
)
import { HStack } from '@einbuergerungstest/design-system/jsx'
