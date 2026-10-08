import { Button, Dialog, InlineNotice } from '@einbuergerungstest/design-system'
import { Grid, Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Check } from 'lucide-react'

import type { MockPageModel } from '../../../../mock-test.model'

type MockDialogsProps = Readonly<{ model: MockPageModel }>

export const MockDialogs = reatomComponent(({ model }: MockDialogsProps) => {
  const t = model.localization.t()
  const isPending = model.mock.pending()
  const current = model()

  return (
    <>
      <Dialog
        opened={model.mock.submission()}
        onClose={wrap(() => {
          if (!isPending) {
            model.mock.cancelSubmission()
          }
        })}
        title={t('dialogs.submitTitle')}
        closeButtonProps={{ 'aria-label': t('common.close'), disabled: isPending }}
      >
        <Stack gap="24">
          <InlineNotice intent="warning">
            {t('mock.blanks', { count: model.mock.unanswered() })}
          </InlineNotice>
          <p>{t('dialogs.submitBody')}</p>
          {model.mock.error() === null ? null : (
            <InlineNotice intent="danger" role="alert">
              {t(model.hasConflict() ? 'errors.storageConflict' : 'errors.storage')}
              {model.hasConflict() ? (
                <Button onClick={wrap(model.reload)}>{t('common.reload')}</Button>
              ) : null}
            </InlineNotice>
          )}
          <Wrap gap="8">
            <Button
              appearance="outline"
              data-autofocus
              disabled={isPending}
              onClick={wrap(model.returnToQuestions)}
            >
              {t('mock.backToQuestions')}
            </Button>
            <Button
              disabled={isPending}
              onClick={wrap(() => {
                void model.mock.confirmSubmission()
              })}
            >
              {t('mock.submit')}
            </Button>
          </Wrap>
        </Stack>
      </Dialog>
      <Dialog
        opened={model.picker()}
        onClose={wrap(model.closePicker)}
        title={t('mock.questionList')}
        closeButtonProps={{ 'aria-label': t('common.close') }}
      >
        <Stack gap="16">
          <p>
            {t('mock.counts', {
              answered: 33 - model.mock.unanswered(),
              unanswered: model.mock.unanswered(),
            })}
          </p>
          <Grid columns={4} gap="8">
            {current.sitting?.answers.map((answer, index) => (
              <Button
                key={answer.questionKey}
                appearance={index === current.index ? 'solid' : 'outline'}
                aria-current={index === current.index ? 'step' : undefined}
                aria-label={`${t('common.questionPosition', { current: index + 1, total: 33 })}: ${t(answer.selectedOption === null ? 'mock.unanswered' : 'mock.answered')}`}
                disabled={isPending}
                onClick={wrap(() => {
                  model.closePicker()

                  void model.questions.go(index)
                })}
                rightSection={
                  answer.selectedOption === null ? undefined : (
                    <Check size={14} aria-hidden="true" />
                  )
                }
              >
                {index + 1}
              </Button>
            ))}
          </Grid>
        </Stack>
      </Dialog>
    </>
  )
}, 'MockDialogs')
