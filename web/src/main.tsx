import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import type { QuestionBank, QuestionKey } from './modules/question-bank/domain/question-bank'
import { mainStyles } from './main.styles'
import { getQuestionKey } from './modules/question-bank/domain/question-bank'
import {
  fetchQuestionBank,
  resolveQuestionImage,
} from './modules/question-bank/infrastructure/question-bank-resource'

import '@app/design-system/styles.css'

type ImageExample = Readonly<{
  questionKey: QuestionKey
  alt: string
  loading: 'eager' | 'lazy'
}>

const imageExamples: readonly ImageExample[] = [
  {
    questionKey: 'general:21',
    alt: 'Four numbered emblems: a black eagle on yellow, a Chi-Rho symbol, a cross, and a hammer-and-compass emblem.',
    loading: 'eager',
  },
  {
    questionKey: 'general:55',
    alt: 'The Reichstag building in Berlin with its glass dome and German flags.',
    loading: 'lazy',
  },
]

type QuestionImageExampleProps = Readonly<ImageExample & { bank: QuestionBank; bankUrl: URL }>

const QuestionImageExample = ({
  bank,
  bankUrl,
  questionKey,
  alt,
  loading,
}: QuestionImageExampleProps) => {
  const question = bank.questions.find((item) => getQuestionKey(item) === questionKey)
  const image = question === undefined ? undefined : resolveQuestionImage(question, bankUrl)

  if (question === undefined || image === undefined) {
    return null
  }

  return (
    <figure className={mainStyles.figure}>
      <img
        src={image.url}
        srcSet={image.variants.map(({ url, width }) => `${url} ${width}w`).join(', ')}
        sizes="(max-width: 32.75rem) calc(100vw - 2.75rem), 30rem"
        width={image.width}
        height={image.height}
        alt={alt}
        loading={loading}
        className={mainStyles.image}
      />
      <figcaption className={mainStyles.caption}>{question.question_en}</figcaption>
    </figure>
  )
}

type QuestionBankState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'ready'; bank: QuestionBank; url: URL }>
  | Readonly<{ status: 'error'; message: string }>

const App = () => {
  const [state, setState] = useState<QuestionBankState>({ status: 'loading' })

  const loadQuestionBank = useCallback(async () => {
    try {
      const { bank, url } = await fetchQuestionBank()

      setState({ status: 'ready', bank, url })
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown resource error.',
      })
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Loading updates state after the fetch settles.
    void loadQuestionBank()
  }, [loadQuestionBank])

  if (state.status === 'ready') {
    return (
      <main className={mainStyles.root}>
        <h1>Einbürgerungstest</h1>
        <output>Question bank ready: {state.bank.question_count} questions.</output>
        <section aria-labelledby="example-images">
          <h2 id="example-images">Example illustrations</h2>
          <div className={mainStyles.examples}>
            {imageExamples.map((example) => (
              <QuestionImageExample
                key={example.questionKey}
                bank={state.bank}
                bankUrl={state.url}
                {...example}
              />
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className={mainStyles.root}>
        <h1>Einbürgerungstest</h1>
        <p role="alert">The question bank could not be loaded. {state.message}</p>
        <button
          type="button"
          onClick={() => {
            setState({ status: 'loading' })

            void loadQuestionBank()
          }}
        >
          Retry
        </button>
      </main>
    )
  }

  return (
    <main className={mainStyles.root}>
      <h1>Einbürgerungstest</h1>
      <output>Loading the question bank…</output>
    </main>
  )
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Cannot start the app: index.html must contain #root.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
