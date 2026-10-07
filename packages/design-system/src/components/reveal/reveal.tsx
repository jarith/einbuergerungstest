import type { ReactNode } from 'react'

import { reveal } from './reveal.styles'

export type RevealProps = Readonly<{ opened: boolean; children: ReactNode }>

/** Keeps content mounted so expansion can reverse without restarting or replaying on arrival. */
export const Reveal = ({ opened, children }: RevealProps) => {
  const styles = reveal({ opened })

  return (
    <span className={styles.root} data-open={opened} aria-hidden={!opened} inert={!opened}>
      <span className={styles.content}>{children}</span>
    </span>
  )
}
