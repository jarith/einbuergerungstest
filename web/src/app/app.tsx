import { Button, DesignSystemProvider } from '@app/design-system'
import { wrap } from '@reatom/core'
import { reatomComponent, reatomContext, reatomFactoryComponent } from '@reatom/react'

import { Counter } from '../modules/counter'
import { createAppModel } from './app.model'
import { appStyles } from './app.styles'

type AppViewProps = Readonly<{ model: ReturnType<typeof createAppModel> }>

const AppView = reatomComponent(
  ({ model }: AppViewProps) => (
    <DesignSystemProvider colorScheme={model.colorScheme()}>
      <main className={appStyles.page}>
        <header className={appStyles.header}>
          <div>
            <h1 className={appStyles.title}>Web app starter</h1>
            <p className={appStyles.subtitle}>Your next idea starts here.</p>
          </div>
          <Button appearance="outline" onClick={wrap(model.toggleColorScheme)}>
            {model.colorScheme() === 'light' ? 'Use dark theme' : 'Use light theme'}
          </Button>
        </header>
        <Counter />
        <footer className={appStyles.footer}>A clean foundation. Make it your own.</footer>
      </main>
    </DesignSystemProvider>
  ),
  'AppView',
)

export const App = reatomFactoryComponent(() => {
  const model = createAppModel()

  return () => (
    <reatomContext.Provider value={model.frame}>
      <AppView model={model} />
    </reatomContext.Provider>
  )
}, 'App')
