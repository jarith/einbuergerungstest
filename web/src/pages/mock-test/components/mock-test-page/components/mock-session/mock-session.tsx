import { Button, StatusBadge } from '@einbuergerungstest/design-system'
import { Grid, Stack, Toolbar } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'

import type { MockPageModel } from '../../../../mock-test.model'
import { QuestionContent } from '../../../../../../modules/question-bank'
import { styles } from '../../mock-test-page.styles'
import { MockDialogs } from '../mock-dialogs/mock-dialogs'
import { MockSummary } from '../mock-summary/mock-summary'

type MockSessionProps = Readonly<{ model: MockPageModel }>

export const MockSession = reatomComponent(({ model }: MockSessionProps) => {
  const { sitting, loaded, answer, index } = model()
  const t = model.localization.t()
  const seconds = model.mock.remaining()

  const timer = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`

  const isPending = model.mock.pending() || seconds === 0 || sitting?.status !== 'active'

  return (
    <Stack gap="16">
      <Toolbar placeContent="normal space-between">
        <h1 className={styles.eyebrow}>
          {t('navigation.mockTest')} /{' '}
          {t('common.questionPosition', { current: index + 1, total: 33 })}
        </h1>
        <StatusBadge
          intent={seconds <= 300 ? 'warning' : 'neutral'}
          leftSection={<Clock size={16} aria-hidden="true" />}
        >
          <span role="timer" aria-label={t('mock.timeRemaining')} className={styles.timer}>
            {timer}
          </span>
        </StatusBadge>
      </Toolbar>
      <Grid css={styles.columns}>
        <Stack gap="16" minWidth="0">
          {loaded === undefined || answer === undefined ? null : (
            <QuestionContent
              loaded={loaded}
              interaction={{
                mode: 'live-mock',
                isPending,
                onSelect: wrap((option) => {
                  void model.mock.select(loaded.key, option)
                }),
              }}
              selectedOption={answer.selectedOption}
              language={model.localization.language()}
              translationEnabled={false}
              onTranslationChange={() => undefined}
              t={t}
            />
          )}
          <Grid css={styles.controls}>
            <Button
              appearance="outline"
              disabled={isPending || index <= 0}
              leftSection={<ArrowLeft size={16} aria-hidden="true" />}
              onClick={wrap(() => model.go(index - 1))}
            >
              {t('study.previous')}
            </Button>
            <Button
              disabled={isPending || index >= 32}
              rightSection={<ArrowRight size={16} aria-hidden="true" />}
              onClick={wrap(() => model.go(index + 1))}
            >
              {t('common.next')}
            </Button>
          </Grid>
        </Stack>
        <MockSummary model={model} />
      </Grid>
      <MockDialogs model={model} />
    </Stack>
  )
}, 'MockSession')
