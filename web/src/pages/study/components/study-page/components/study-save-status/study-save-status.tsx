import { InlineNotice } from '@einbuergerungstest/design-system'
import { reatomComponent } from '@reatom/react'

import type { StudySessionProps } from '../study-session/study-session'
import { PendingNotice } from '../../../../../../app/components/pending-notice/pending-notice'
import { isLearnerStateConflict } from '../../../../../../modules/learner-state'

export const StudySaveStatus = reatomComponent(({ model }: StudySessionProps) => {
  const t = model.localization.t()
  const error = model.flow.error()

  return (
    <>
      <output>
        {model.flow.saving() ? (
          <PendingNotice message={t('common.saving')} longWaitMessage={t('common.savingSlow')} />
        ) : null}
      </output>
      {error !== null ? (
        <InlineNotice intent="danger" role="alert">
          {t(isLearnerStateConflict(error) ? 'errors.storageConflict' : 'errors.storage')}
        </InlineNotice>
      ) : null}
    </>
  )
}, 'StudySaveStatus')
