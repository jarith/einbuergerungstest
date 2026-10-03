/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable image viewport needs keyboard focus for native arrow-key panning. */

import type { TFunction } from 'i18next'
import { Button, Dialog, InlineNotice } from '@einbuergerungstest/design-system'
import { Stack, Wrap } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ZoomIn, ZoomOut } from 'lucide-react'

import type { ResolvedQuestionImage } from '../../../../infrastructure/question-bank-resource'
import type { createQuestionImageModel } from '../../question-image.model'
import { imageViewport } from '../../question-image.styles'

type ImageZoomDialogProps = Readonly<{
  image: ResolvedQuestionImage
  alt: string
  t: TFunction
  model: ReturnType<typeof createQuestionImageModel>
}>

export const ImageZoomDialog = reatomComponent(({ image, alt, t, model }: ImageZoomDialogProps) => {
  const state = model()

  return (
    <Dialog
      opened={state.isOpen}
      onClose={wrap(model.close)}
      title={alt}
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Stack gap="layout.inline">
        {state.hasFullError ? (
          <InlineNotice intent="danger" role="alert">
            {t('study.imageError')}
            <Button appearance="outline" onClick={wrap(model.retry)}>
              {t('common.retry')}
            </Button>
          </InlineNotice>
        ) : (
          <section
            className={imageViewport}
            data-zoom={state.zoom}
            tabIndex={0}
            aria-label={t('study.imageViewport')}
          >
            <img
              key={state.revision}
              src={image.url}
              width={image.width}
              height={image.height}
              alt={alt}
              onError={wrap(model.failFull)}
            />
          </section>
        )}
        <Wrap gap="layout.inline" justify="center">
          <Button
            appearance="outline"
            disabled={state.zoom === 1}
            onClick={wrap(model.zoomOut)}
            aria-label={t('study.zoomOut')}
          >
            <ZoomOut size={18} aria-hidden="true" />
          </Button>
          <output>{state.zoom * 100}%</output>
          <Button
            appearance="outline"
            disabled={state.zoom === 3}
            onClick={wrap(model.zoomIn)}
            aria-label={t('study.zoomIn')}
          >
            <ZoomIn size={18} aria-hidden="true" />
          </Button>
          <Button appearance="outline" onClick={wrap(model.close)}>
            {t('common.close')}
          </Button>
        </Wrap>
        <p>{t('study.imageHelp')}</p>
      </Stack>
    </Dialog>
  )
}, 'ImageZoomDialog')
