import type { ReactNode } from 'react'
import { reatomFactoryComponent } from '@reatom/react'

import { createPendingNoticeAtom } from './pending-notice.model'

type PendingNoticeProps = Readonly<{
  message: string
  longWaitMessage: string
  children?: ReactNode
}>

/** Render within the owner's persistent status region. */
export const PendingNotice = reatomFactoryComponent<PendingNoticeProps>(() => {
  const isLongWait = createPendingNoticeAtom()

  return ({ message, longWaitMessage, children }) => (
    <>
      <p>{isLongWait() ? longWaitMessage : message}</p>
      {isLongWait() ? children : null}
    </>
  )
}, 'PendingNotice')
