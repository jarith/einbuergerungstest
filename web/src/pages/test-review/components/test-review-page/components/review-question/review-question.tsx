import { Button, ButtonLink, InlineNotice } from '@einbuergerungstest/design-system'
import { Grid, Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { TestReviewModel } from '../../../../test-review.model'
import { QuestionContent } from '../../../../../../modules/question-bank'
import { styles } from '../../test-review-page.styles'

type ReviewQuestionProps = Readonly<{ model: TestReviewModel }>

export const ReviewQuestion = reatomComponent(({ model }: ReviewQuestionProps) => {
  const { sitting, answer, loaded, index } = model()
  const t = model.localization.t()

  const selected = loaded.question.answer_options.find(
    (option) => option.label === answer.selectedOption,
  )

  return (
    <Stack gap="16">
      <p className={styles.muted}>
        {t('mock.review')} ·{' '}
        {t('common.questionPosition', { current: index + 1, total: sitting.answers.length })}
      </p>
      {model.error() ? (
        <InlineNotice intent="danger" role="alert">
          {t('errors.storage')}
        </InlineNotice>
      ) : null}
      <QuestionContent
        loaded={loaded}
        interaction={{
          mode: sitting.status === 'completed' ? 'completed-review' : 'unfinished-review',
        }}
        selectedOption={answer.selectedOption}
        language={model.localization.language()}
        translationEnabled={model.translation().enabled}
        onTranslationChange={wrap((enabled) => {
          void model.setTranslation(enabled)
        })}
        t={t}
      />
      <p>
        {selected === undefined ? (
          t('mock.unanswered')
        ) : (
          <>
            {t('mock.yourChoice')}{' '}
            <span lang="de">
              {selected.label} · {selected.text_de}
            </span>
          </>
        )}
      </p>
      <Grid columns={2} gap="16">
        <Button
          appearance="outline"
          disabled={index === 0}
          leftSection={<ArrowLeft size={16} aria-hidden="true" />}
          onClick={wrap(() => model.go(index - 1))}
        >
          {t('study.previous')}
        </Button>
        <Button
          appearance="outline"
          disabled={index === 32}
          rightSection={<ArrowRight size={16} aria-hidden="true" />}
          onClick={wrap(() => model.go(index + 1))}
        >
          {t('common.next')}
        </Button>
      </Grid>
      <Toolbar placeContent="normal space-between">
        <ButtonLink href="/progress" appearance="outline">
          {t('mock.backToOverview')}
        </ButtonLink>
        <Button onClick={wrap(model.openPicker)}>{t('mock.questionList')}</Button>
      </Toolbar>
    </Stack>
  )
}, 'ReviewQuestion')
