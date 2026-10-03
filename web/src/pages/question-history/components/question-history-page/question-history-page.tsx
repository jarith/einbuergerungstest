import { ButtonLink } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { reatomComponent } from '@reatom/react'
import { ArrowLeft, BookOpen } from 'lucide-react'

import type { PageProps } from '../../../../app/routing'
import type { QuestionHistoryData } from '../../question-history.route'
import { QuestionStatusBadge } from '../../../../modules/learner-state'
import { QuestionImage } from '../../../../modules/question-bank'
import { EarlierAttempts } from './components/earlier-attempts/earlier-attempts'
import { LatestAttempt } from './components/latest-attempt/latest-attempt'
import { styles } from './question-history-page.styles'

export const QuestionHistoryPage = reatomComponent(({ data }: PageProps<QuestionHistoryData>) => {
  const { model } = data
  const { selected } = model
  const t = model.localization.t()

  return (
    <Stack gap="24" css={styles.root}>
      <Stack gap="16">
        <Wrap gap="8" alignItems="center" justifyContent="space-between">
          <p className={styles.eyebrow}>
            {t('history.context', { number: selected.question.number })}
          </p>
          <QuestionStatusBadge status={model().progress.status} t={t} />
        </Wrap>
        <h2 lang="de" className={styles.heading}>
          {selected.question.question_de}
        </h2>
        {selected.image === undefined ? null : (
          <QuestionImage
            image={selected.image}
            alt={t('study.imageAlt', { number: selected.question.number })}
            t={t}
          />
        )}
      </Stack>
      <LatestAttempt model={model} />
      <EarlierAttempts model={model} />
      <Wrap gap="16">
        <ButtonLink href={model.studyPath} leftSection={<BookOpen size={16} aria-hidden="true" />}>
          {t('history.study')}
        </ButtonLink>
        <ButtonLink
          href={model.listPath}
          appearance="ghost"
          leftSection={<ArrowLeft size={16} aria-hidden="true" />}
        >
          {t('history.back')}
        </ButtonLink>
      </Wrap>
    </Stack>
  )
}, 'QuestionHistoryPage')
