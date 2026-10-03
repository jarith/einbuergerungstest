/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable image viewport needs keyboard focus for native arrow-key panning. */

import type { TFunction } from 'i18next'
import type { CSSProperties } from 'react'
import { Button, Dialog, InlineNotice } from '@einbuergerungstest/design-system'
import { Flex, Stack } from '@einbuergerungstest/design-system/jsx'
import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { ZoomIn, ZoomOut } from 'lucide-react'

import type { ResolvedQuestionImage } from '../../../../infrastructure/question-bank-resource'
import type { createQuestionImageModel } from '../../question-image.model'
import { styles } from './image-zoom-dialog.styles'

type ImageZoomDialogProps = Readonly<{
  image: ResolvedQuestionImage
  alt: string
  t: TFunction
  model: ReturnType<typeof createQuestionImageModel>
}>

type ImageStyle = CSSProperties & Readonly<{ '--image-ratio': number }>

export const ImageZoomDialog = reatomComponent(({ image, alt, t, model }: ImageZoomDialogProps) => {
  const state = model()
  const imageStyle: ImageStyle = { '--image-ratio': image.width / image.height }

  return (
    <Dialog
      fullScreen
      opened={state.isOpen}
      onClose={wrap(model.close)}
      title={alt}
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Stack gap="layout.inline" css={styles.layout}>
        <section
          className={styles.viewport}
          data-zoom={state.zoom}
          tabIndex={0}
          aria-label={t('study.imageViewport')}
        >
          {state.hasFullError ? (
            <InlineNotice intent="danger" role="alert">
              {t('study.imageError')}
              <Button appearance="outline" onClick={wrap(model.retry)}>
                {t('common.retry')}
              </Button>
            </InlineNotice>
          ) : (
            <Flex css={styles.canvas}>
              <img
                key={state.revision}
                src={image.url}
                width={image.width}
                height={image.height}
                alt={alt}
                className={styles.image}
                style={imageStyle}
                onError={wrap(model.failFull)}
              />
            </Flex>
          )}
        </section>
        <Flex gap="layout.inline" css={styles.controls}>
          <Button
            appearance="outline"
            disabled={state.zoom === 1}
            onClick={wrap(model.zoomOut)}
            aria-label={t('study.zoomOut')}
          >
            <ZoomOut size={18} aria-hidden="true" />
          </Button>
          <output className={styles.zoomLevel}>{state.zoom * 100}%</output>
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
        </Flex>
        <p className={styles.help}>{t('study.imageHelp')}</p>
      </Stack>
    </Dialog>
  )
}, 'ImageZoomDialog')
