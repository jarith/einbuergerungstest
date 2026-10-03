import type { TFunction } from 'i18next'
import { Button, InlineNotice, Panel } from '@einbuergerungstest/design-system'
import { Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomFactoryComponent } from '@reatom/react'
import { ZoomIn } from 'lucide-react'

import type { ResolvedQuestionImage } from '../../infrastructure/question-bank-resource'
import { ImageZoomDialog } from './components/image-zoom-dialog/image-zoom-dialog'
import { createQuestionImageModel } from './question-image.model'
import { questionImage } from './question-image.styles'

type QuestionImageProps = Readonly<{ image: ResolvedQuestionImage; alt: string; t: TFunction }>

export const QuestionImage = reatomFactoryComponent<QuestionImageProps>(() => {
  const model = createQuestionImageModel()

  return ({ image, alt, t }) => {
    const state = model()

    return (
      <Panel>
        <Stack gap="layout.inline">
          {state.hasInlineError ? (
            <InlineNotice intent="danger" role="alert">
              {t('study.imageError')}
              <Button appearance="outline" onClick={wrap(model.retry)}>
                {t('common.retry')}
              </Button>
            </InlineNotice>
          ) : (
            <img
              key={state.revision}
              src={image.url}
              srcSet={image.variants
                .map((variant) => `${variant.url} ${variant.width}w`)
                .join(', ')}
              sizes="(max-width: 48rem) calc(100vw - 4rem), (max-width: 75rem) calc(100vw - 6rem), 48rem"
              width={image.width}
              height={image.height}
              alt={alt}
              className={questionImage}
              onError={wrap(model.failInline)}
            />
          )}
          <Button
            appearance="ghost"
            onClick={wrap(model.open)}
            leftSection={<ZoomIn size={18} aria-hidden="true" />}
          >
            {t('study.zoomImage')}
          </Button>
        </Stack>
        <ImageZoomDialog image={image} alt={alt} t={t} model={model} />
      </Panel>
    )
  }
}, 'QuestionImage')
