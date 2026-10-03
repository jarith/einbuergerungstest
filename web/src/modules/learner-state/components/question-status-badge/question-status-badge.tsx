import type { StatusBadgeProps } from '@einbuergerungstest/design-system'
import type { TFunction } from 'i18next'
import { StatusBadge } from '@einbuergerungstest/design-system'
import { Circle, CircleCheck, CircleX, BookOpen } from 'lucide-react'

import type { LearningStatus } from '../../domain/question-progress'

type QuestionStatusBadgeProps = Readonly<{ status: LearningStatus; t: TFunction }>

const presentation = {
  'not-started': { intent: 'neutral', label: 'progress.not-started', Icon: Circle },
  'needs-review': { intent: 'danger', label: 'progress.needs-review', Icon: CircleX },
  learning: { intent: 'learning', label: 'progress.learning', Icon: BookOpen },
  learned: { intent: 'success', label: 'progress.learned', Icon: CircleCheck },
} as const satisfies Record<
  LearningStatus,
  { intent: StatusBadgeProps['intent']; label: string; Icon: typeof Circle }
>

export const QuestionStatusBadge = ({ status, t }: QuestionStatusBadgeProps) => {
  const { intent, label, Icon } = presentation[status]

  return (
    <StatusBadge intent={intent} leftSection={<Icon size={14} aria-hidden="true" />}>
      {t(label)}
    </StatusBadge>
  )
}
