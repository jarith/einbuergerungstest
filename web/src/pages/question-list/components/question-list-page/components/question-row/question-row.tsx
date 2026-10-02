import type { TFunction } from 'i18next'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { Image } from 'lucide-react'

import type { QuestionListModel } from '../../../../question-list.model'
import { QuestionStatusBadge } from '../../../../../../modules/learner-state'
import { styles } from './question-row.styles'

type QuestionRowProps = Readonly<{ row: ReturnType<QuestionListModel>[number]; t: TFunction }>

export const QuestionRow = ({ row, t }: QuestionRowProps) => (
  <li>
    <a href={row.href} className={styles.link}>
      <span className={styles.number}>{row.question.number}</span>
      <Stack css={styles.content}>
        <span lang="de" className={styles.prompt}>
          {row.question.question_de}
        </span>
        <Wrap css={styles.meta}>
          <span className={styles.muted}>
            {row.history.attemptCount === 0
              ? t('questions.noAttempts')
              : t('common.attempt', { count: row.history.attemptCount })}
          </span>
          {row.question.question_image_resource === undefined ? null : (
            <Wrap gap="8" alignItems="center">
              <Image size={16} aria-hidden="true" />
              <span className={styles.muted}>{t('questions.hasImage')}</span>
            </Wrap>
          )}
        </Wrap>
      </Stack>
      <QuestionStatusBadge status={row.history.status} t={t} />
    </a>
  </li>
)
