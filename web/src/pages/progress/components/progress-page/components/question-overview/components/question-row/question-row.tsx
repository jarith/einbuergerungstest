import type { TFunction } from 'i18next'
import { Flex, Wrap } from '@einbuergerungstest/design-system/jsx'
import { Image } from 'lucide-react'

import type { ProgressPageModel } from '../../../../../../progress.model'
import { QuestionStatusBadge } from '../../../../../../../../modules/learner-state'
import { styles } from '../../../../progress-page.styles'

type QuestionRowProps = Readonly<{ row: ReturnType<ProgressPageModel>[number]; t: TFunction }>

export const QuestionRow = ({ row, t }: QuestionRowProps) => (
  <li>
    <a href={row.href} className={styles.questionRow}>
      <span lang="de" className={styles.prompt}>
        {row.question.order} · {row.question.question_de}
      </span>
      <Wrap gap="12" alignItems="center" justifyContent="space-between">
        <span className={styles.muted}>
          {row.history.attemptCount === 0
            ? t('questions.noAttempts')
            : t('common.attempt', { count: row.history.attemptCount })}
        </span>
        <Wrap gap="12" alignItems="center">
          {row.question.question_image_resource === undefined ? null : (
            <Flex css={styles.imageNote}>
              <Image size={16} aria-hidden="true" />
              <span className={styles.muted}>{t('questions.hasImage')}</span>
            </Flex>
          )}
          <QuestionStatusBadge status={row.history.status} t={t} />
        </Wrap>
      </Wrap>
    </a>
  </li>
)
